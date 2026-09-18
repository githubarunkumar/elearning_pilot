require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { db, hashPassword } = require('./db');
const { getPublicQuestions, buildShuffledSet, scoreAnswers, QUESTIONS } = require('./quizData');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

// ---------------------------------------------------------------------------
// Settings helpers
// ---------------------------------------------------------------------------
function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  return {
    passScorePercent: Number(s.pass_score_percent || 80),
    maxAttempts: Number(s.max_attempts || 3),
    cooldownMinutes: Number(s.cooldown_minutes || 60),
    courseTitle: s.course_title || 'Emergency Preparedness & Environmental Awareness',
  };
}

// ---------------------------------------------------------------------------
// Admin auth middleware
// ---------------------------------------------------------------------------
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing admin session token.' });
  const session = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ error: 'Invalid session.' });
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  req.adminUsername = session.username;
  next();
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true, time: now() }));

// ---------------------------------------------------------------------------
// Learner intake / resume (no authentication - per project decision, learner is
// identified by Employee ID + Email + Name only)
// ---------------------------------------------------------------------------
app.post('/api/learners', (req, res) => {
  const { empId, name, email, language } = req.body || {};
  if (!empId || !name || !email) {
    return res.status(400).json({ error: 'Employee ID, Name, and Email are required.' });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) return res.status(400).json({ error: 'Please enter a valid email address.' });

  const existing = db.prepare('SELECT * FROM learners WHERE emp_id = ?').get(empId.trim());
  if (existing) {
    db.prepare('UPDATE learners SET last_seen_at = ?, language = ? WHERE id = ?').run(
      now(),
      language || existing.language,
      existing.id
    );
    return res.json({ learner: { ...existing, language: language || existing.language }, resumed: true });
  }
  const learner = {
    id: uuid(),
    emp_id: empId.trim(),
    name: name.trim(),
    email: email.trim(),
    language: language || 'en',
    created_at: now(),
    last_seen_at: now(),
  };
  db.prepare(
    `INSERT INTO learners (id, emp_id, name, email, language, created_at, last_seen_at)
     VALUES (@id, @emp_id, @name, @email, @language, @created_at, @last_seen_at)`
  ).run(learner);
  res.json({ learner, resumed: false });
});

app.get('/api/learners/:id', (req, res) => {
  const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
  if (!learner) return res.status(404).json({ error: 'Learner not found.' });
  const progress = db.prepare('SELECT screen_id, module, completed_at FROM progress WHERE learner_id = ?').all(learner.id);
  const attempts = db
    .prepare('SELECT attempt_type, score, total, passed, submitted_at FROM quiz_attempts WHERE learner_id = ? ORDER BY submitted_at')
    .all(learner.id);
  res.json({ learner, progress, attempts });
});

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------
app.post('/api/progress', (req, res) => {
  const { learnerId, screenId, module } = req.body || {};
  if (!learnerId || !screenId || !module) {
    return res.status(400).json({ error: 'learnerId, screenId, and module are required.' });
  }
  db.prepare(
    `INSERT INTO progress (learner_id, screen_id, module, completed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(learner_id, screen_id) DO UPDATE SET completed_at = excluded.completed_at`
  ).run(learnerId, screenId, module, now());
  db.prepare('UPDATE learners SET last_seen_at = ? WHERE id = ?').run(now(), learnerId);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Practice checks (ungraded, unlimited attempts, immediate per-question feedback)
// ---------------------------------------------------------------------------
app.get('/api/quiz/practice/:module', (req, res) => {
  const mod = req.params.module; // 'm1' | 'm2'
  const ids = QUESTIONS.filter((q) => q.module === mod).map((q) => q.id);
  if (ids.length === 0) return res.status(404).json({ error: 'Unknown module.' });
  res.json({ questions: buildShuffledSet(ids) });
});

app.post('/api/quiz/check', (req, res) => {
  const { id, selectedOriginalIndex } = req.body || {};
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) return res.status(404).json({ error: 'Unknown question.' });
  const correct = q.correctIndex === selectedOriginalIndex;
  res.json({ correct, correctIndex: q.correctIndex, correctText: q.options[q.correctIndex], explanation: q.explanation });
});

// ---------------------------------------------------------------------------
// Final Assessment (graded, admin-configurable pass score / attempts / cooldown,
// question + option order randomized per attempt)
// ---------------------------------------------------------------------------
function computeFinalEligibility(learnerId) {
  const settings = getSettings();
  const attempts = db
    .prepare('SELECT * FROM quiz_attempts WHERE learner_id = ? AND attempt_type = ? ORDER BY submitted_at')
    .all(learnerId, 'final');

  const alreadyPassed = attempts.find((a) => a.passed === 1);
  if (alreadyPassed) {
    return { eligible: false, reason: 'already_passed', attempt: alreadyPassed, settings, attemptsUsed: attempts.length };
  }
  if (attempts.length >= settings.maxAttempts) {
    return { eligible: false, reason: 'attempts_exhausted', settings, attemptsUsed: attempts.length };
  }
  const last = attempts[attempts.length - 1];
  if (last) {
    const retryAt = new Date(new Date(last.submitted_at).getTime() + settings.cooldownMinutes * 60000);
    if (retryAt > new Date()) {
      return { eligible: false, reason: 'cooldown', retryAt: retryAt.toISOString(), settings, attemptsUsed: attempts.length };
    }
  }
  return { eligible: true, settings, attemptsUsed: attempts.length, attemptsRemaining: settings.maxAttempts - attempts.length };
}

app.get('/api/quiz/final/eligibility/:learnerId', (req, res) => {
  res.json(computeFinalEligibility(req.params.learnerId));
});

app.get('/api/quiz/final/start/:learnerId', (req, res) => {
  const elig = computeFinalEligibility(req.params.learnerId);
  if (!elig.eligible) return res.status(403).json(elig);
  const ids = QUESTIONS.map((q) => q.id);
  res.json({ questions: buildShuffledSet(ids), settings: elig.settings, attemptsRemaining: elig.attemptsRemaining });
});

app.post('/api/quiz/final/submit', (req, res) => {
  const { learnerId, answers, startedAt } = req.body || {};
  if (!learnerId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'learnerId and answers[] are required.' });
  }
  const elig = computeFinalEligibility(learnerId);
  if (!elig.eligible) return res.status(403).json(elig);

  const { score, total, detail } = scoreAnswers(answers);
  const percent = Math.round((score / total) * 100);
  const passed = percent >= elig.settings.passScorePercent ? 1 : 0;

  db.prepare(
    `INSERT INTO quiz_attempts (learner_id, attempt_type, score, total, passed, answers_json, started_at, submitted_at)
     VALUES (?, 'final', ?, ?, ?, ?, ?, ?)`
  ).run(learnerId, score, total, passed, JSON.stringify(detail), startedAt || now(), now());

  const postElig = computeFinalEligibility(learnerId);
  res.json({
    score,
    total,
    percent,
    passed: !!passed,
    passScorePercent: elig.settings.passScorePercent,
    detail,
    attemptsRemaining: postElig.eligible ? postElig.attemptsRemaining : 0,
    retryAt: postElig.reason === 'cooldown' ? postElig.retryAt : null,
    exhausted: postElig.reason === 'attempts_exhausted',
  });
});

// ---------------------------------------------------------------------------
// Public settings + contact directory (read-only for learners)
// ---------------------------------------------------------------------------
app.get('/api/settings', (req, res) => res.json(getSettings()));

app.get('/api/contacts', (req, res) => {
  const rows = db.prepare('SELECT category, label, value FROM contacts ORDER BY category, sort_order').all();
  const grouped = { security: [], fire: [], medical: [] };
  for (const r of rows) if (grouped[r.category]) grouped[r.category].push({ label: r.label, value: r.value });
  res.json(grouped);
});

// ---------------------------------------------------------------------------
// Admin: auth
// ---------------------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username || '');
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
  const hash = hashPassword(password || '', user.salt);
  if (hash !== user.hash) return res.status(401).json({ error: 'Invalid credentials.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8h session
  db.prepare('INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    user.username,
    now(),
    expires
  );
  res.json({ token, expiresAt: expires });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const token = (req.headers.authorization || '').slice(7);
  db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  res.json({ ok: true });
});

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(newPassword, salt);
  db.prepare('UPDATE admin_users SET salt = ?, hash = ? WHERE username = ?').run(salt, hash, req.adminUsername);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Admin: settings (pass score / attempts / cooldown)
// ---------------------------------------------------------------------------
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const { passScorePercent, maxAttempts, cooldownMinutes, courseTitle } = req.body || {};
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  if (passScorePercent !== undefined) upsert.run('pass_score_percent', String(passScorePercent));
  if (maxAttempts !== undefined) upsert.run('max_attempts', String(maxAttempts));
  if (cooldownMinutes !== undefined) upsert.run('cooldown_minutes', String(cooldownMinutes));
  if (courseTitle !== undefined) upsert.run('course_title', String(courseTitle));
  res.json(getSettings());
});

// ---------------------------------------------------------------------------
// Admin: contact directory (HR-owned, editable without a code deployment)
// ---------------------------------------------------------------------------
app.put('/api/admin/contacts', requireAdmin, (req, res) => {
  const { security = [], fire = [], medical = [] } = req.body || {};
  const del = db.prepare('DELETE FROM contacts');
  const ins = db.prepare('INSERT INTO contacts (category, label, value, sort_order) VALUES (?, ?, ?, ?)');
  const tx = db.transaction(() => {
    del.run();
    security.forEach((c, i) => ins.run('security', c.label, c.value, i + 1));
    fire.forEach((c, i) => ins.run('fire', c.label, c.value, i + 1));
    medical.forEach((c, i) => ins.run('medical', c.label, c.value, i + 1));
  });
  tx();
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Admin: analytics dashboard
// ---------------------------------------------------------------------------
const ALL_SCREENS_COUNT = 20; // S0/S1/S2 + 5+1 (M1) + 7+1 (M2) + FA-S1..S4 (excluding result variability)

app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  const totalLearners = db.prepare('SELECT COUNT(*) c FROM learners').get().c;
  const started = db
    .prepare('SELECT COUNT(DISTINCT learner_id) c FROM progress')
    .get().c;
  const finalAttempts = db.prepare("SELECT * FROM quiz_attempts WHERE attempt_type = 'final'").all();
  const passedLearnerIds = new Set(finalAttempts.filter((a) => a.passed).map((a) => a.learner_id));
  const completed = passedLearnerIds.size;
  const inProgress = Math.max(0, started - completed);
  const notStarted = Math.max(0, totalLearners - started);

  const avgScore = finalAttempts.length
    ? Math.round(
        (finalAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / finalAttempts.length) * 10
      ) / 10
    : 0;

  res.json({
    totalLearners,
    notStarted,
    inProgress,
    completed,
    started,
    completionRatePercent: totalLearners ? Math.round((completed / totalLearners) * 100) : 0,
    totalFinalAttempts: finalAttempts.length,
    averageFinalScorePercent: avgScore,
  });
});

app.get('/api/admin/learners', requireAdmin, (req, res) => {
  const learners = db.prepare('SELECT * FROM learners ORDER BY created_at DESC').all();
  const result = learners.map((l) => {
    const progressCount = db.prepare('SELECT COUNT(*) c FROM progress WHERE learner_id = ?').get(l.id).c;
    const attempts = db
      .prepare("SELECT * FROM quiz_attempts WHERE learner_id = ? AND attempt_type = 'final' ORDER BY submitted_at")
      .all(l.id);
    const passed = attempts.find((a) => a.passed);
    const best = attempts.reduce((m, a) => Math.max(m, Math.round((a.score / a.total) * 100)), 0);
    return {
      empId: l.emp_id,
      name: l.name,
      email: l.email,
      language: l.language,
      screensCompleted: progressCount,
      finalAttempts: attempts.length,
      bestScorePercent: best,
      status: passed ? 'Completed' : progressCount > 0 ? 'In Progress' : 'Not Started',
      lastSeenAt: l.last_seen_at,
    };
  });
  res.json(result);
});

app.get('/api/admin/learners/export.csv', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM learners ORDER BY created_at').all();
  const header = 'EmployeeID,Name,Email,Language,ScreensCompleted,FinalAttempts,BestScorePercent,Status,LastSeenAt\n';
  const lines = rows.map((l) => {
    const progressCount = db.prepare('SELECT COUNT(*) c FROM progress WHERE learner_id = ?').get(l.id).c;
    const attempts = db
      .prepare("SELECT * FROM quiz_attempts WHERE learner_id = ? AND attempt_type = 'final'")
      .all(l.id);
    const passed = attempts.find((a) => a.passed);
    const best = attempts.reduce((m, a) => Math.max(m, Math.round((a.score / a.total) * 100)), 0);
    const status = passed ? 'Completed' : progressCount > 0 ? 'In Progress' : 'Not Started';
    return [l.emp_id, l.name, l.email, l.language, progressCount, attempts.length, best, status, l.last_seen_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',');
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="learner_export.csv"');
  res.send(header + lines.join('\n'));
});

app.get('/api/admin/contacts-raw', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT category, label, value FROM contacts ORDER BY category, sort_order').all();
  const grouped = { security: [], fire: [], medical: [] };
  for (const r of rows) if (grouped[r.category]) grouped[r.category].push({ label: r.label, value: r.value });
  res.json(grouped);
});

app.listen(PORT, () => {
  console.log(`ACG e-learning API listening on http://localhost:${PORT}`);
});
