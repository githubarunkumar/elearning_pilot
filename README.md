# ACG Safety & Environmental Awareness — E-Learning Pilot

An independent, self-hosted e-learning web application for the **Environmental
Awareness + Emergency Preparedness** pilot module. Built as a standalone app
(no LMS, no SCORM, no external vendor) per the project's Phase 1 scope, with
content, application logic, and learner data kept separate so the module can
be wired into SAP SuccessFactors or another LMS in a later phase.

This pilot currently ships the **English** learner experience end-to-end.
Hindi and Marathi content scripts exist in the project's documentation
(`Narration and Content Script - Hindi/Marathi...`) but have not yet been
wired into the running application — see "Known limitations" below.

---

## 1. What's included

```
acg-elearning-pilot/
├── server/          Node.js + Express + SQLite backend (API, scoring, analytics)
└── client/          React + Vite frontend (learner app + admin panel)
```

- **Learner experience**: no-login identification (Employee ID + Name + Email),
  two content modules with interactive screens (flip cards, hotspots, a
  tap-to-sort waste classifier, scenario checks, an org chart, a sequence
  builder, a communication-cycle diagram, an editable emergency contact
  directory, first-aid prompts), an ungraded practice check after each module,
  and a final 10-question graded assessment with pass/fail, cooldown, and
  retake logic.
- **Assessment engine**: questions and correct answers live only on the
  server; each attempt gets a fresh shuffle of question order and option
  order so the answer key can't be read from client source or memorized by
  position.
- **Admin panel** (`/admin`): analytics (total/started/in-progress/completed
  learners, completion rate, attempts, average score), a learner-level table
  with CSV export, editable pass score / max attempts / cooldown settings,
  an HR-editable emergency contact directory, and admin password change.
- **Accessibility-minded interactions**: tap-to-select-then-place instead of
  drag-and-drop for the waste sorter; up/down buttons instead of drag for the
  emergency-response sequence; an optional "Read aloud" button using the
  browser's built-in text-to-speech (no external TTS cost or dependency).

## 2. Technology choices (and why)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Open-source, fast dev/build, large ecosystem, easy to hand off |
| Backend | Node.js + Express | Open-source, minimal, easy to host anywhere |
| Database | SQLite (`better-sqlite3`) | Zero-config, file-based, no separate DB server to install/manage for a 200-learner pilot; a real Postgres/MySQL swap is a small change later if scale requires it |
| Auth (learner) | None — Employee ID + Name + Email | Per project decision: no SSO/authentication required for the pilot |
| Auth (admin) | Username/password + bearer session token | Simple, no external identity provider dependency |
| Narration | Browser Web Speech API | No per-minute TTS cost; works offline; a recorded-voiceover swap is possible later without changing the app |

## 3. Running it locally

Requires Node.js 18+ (20+ recommended).

### Backend

```bash
cd server
npm install
cp .env.example .env      # adjust PORT / DB_PATH if needed
npm start                 # listens on http://localhost:4000 by default
```

On first run the SQLite database file is created automatically (schema +
default settings + default contact directory + a default admin user:
**username `admin`, password `ChangeMe123`**). Change this password
immediately after first login, from the admin Settings tab.

### Frontend

```bash
cd client
npm install
cp .env.example .env      # set VITE_API_URL if the backend isn't on localhost:4000
npm run dev                # dev server, e.g. http://localhost:5173
```

For a production-style build:

```bash
npm run build              # outputs to client/dist
npm run preview            # serves the built app locally for a final check
```

Open the printed URL. The learner app is at `/`, the admin panel at `/admin`.

## 4. Deployment (pilot-scale)

The two halves deploy independently:

- **Backend**: any Node.js host that can run `npm start` and persist a
  writable `server/data/` directory (a small VM, a container, or a PaaS like
  Render/Railway/an internal server). Set `DB_PATH` to a persistent volume if
  the host's filesystem is ephemeral (e.g. some container platforms wipe
  local disk on redeploy — point `DB_PATH` at a mounted volume).
- **Frontend**: the `client/dist` folder is static output — serve it from any
  static host (internal web server, Nginx, an S3/Blob + CDN, Netlify/Vercel,
  or just Express `express.static` alongside the API). Set `VITE_API_URL` at
  build time to the backend's real URL before running `npm run build`.
- **CORS**: the backend allows all origins by default (`cors()` with no
  options) to simplify pilot testing. Before a wider rollout, restrict this
  to the real frontend origin in `server/index.js`.
- **HTTPS**: for real associate use, put both behind HTTPS (a reverse proxy
  like Nginx/Caddy, or the hosting platform's built-in TLS) — the admin
  login and learner data should not travel over plain HTTP outside a
  local test.

No SCORM packaging, no LMS account, and no external vendor account are
required to run this pilot.

## 5. Data model & separation (for future LMS integration)

- **Content** lives entirely in `client/src/content/{en,hi,mr}.js` — plain
  JS objects, independent of the React components that render them and of
  any learner data. Swapping or extending content does not touch app logic.
- **Application logic** is the React components (`client/src/pages`,
  `client/src/components`) and the Express routes (`server/index.js`,
  `server/quizData.js`).
- **Learner data** lives only in SQLite (`server/data/acg_elearning.db`):
  learners, progress, quiz attempts, settings, contacts, admin users/sessions.
  Because this is cleanly separated from content and logic, a future phase
  can point the same content at an LMS-driven identity/progress model (e.g.
  SCORM's `cmi.*` data model or an xAPI LRS) with the frontend components
  largely unchanged.

## 6. Testing performed

Automated end-to-end browser testing (Playwright, Chromium) covered:

- Full learner journey: intake → welcome → objectives → Module 1 (all 4
  screens + practice check) → Module 2 (all 7 screens + practice check) →
  final assessment (10 questions, review step, submit) → result screen →
  completion screen, for both a **failing** attempt (cooldown/retake
  messaging) and a **passing** attempt (score, completion record download).
- Server-side scoring correctness: verified via direct API calls that
  question/option shuffling, scoring, and the pass/attempts-exhausted/
  cooldown eligibility states compute correctly against the configured
  pass threshold.
- Admin panel: login, analytics tile values, learner table + CSV export URL,
  settings save-and-reload (pass score / max attempts / cooldown), contact
  directory save-and-reload, and admin password change (including logging in
  again with the new password).
- Mobile layout: 375×812 viewport across intake, welcome, objectives, and
  both Module 1 interactive screens — no horizontal overflow on any screen.
- No console/page errors observed during any of the above flows.

**A real defect was found and fixed during this testing**: the frontend's
shared `api.js` request helper merged HTTP headers in the wrong order,
which silently dropped the `Content-Type: application/json` header on any
admin write that also needed an `Authorization` header (Settings save,
Contact Directory save, and Change Password). The browser would send the
JSON body as `text/plain`, the server would receive an empty body, and the
UI would still show "Saved ✓" — a silent no-op. This is fixed in
`client/src/api.js`; all three flows are now verified to persist correctly
end-to-end (save → reload → change is still there).

## 7. QA checklist for your own acceptance testing

- [ ] Learner intake accepts Employee ID, Name, and a validly formatted email;
      rejects an incomplete or malformed submission with a visible error.
- [ ] A returning learner (same Employee ID) resumes rather than duplicating.
- [ ] Both modules' interactive screens work with mouse and with touch
      (tablet/phone) input, without drag-and-drop.
- [ ] Practice checks give immediate per-question feedback and don't block
      progress on a wrong answer; the Continue button enables only once every
      question has been answered.
- [ ] Final assessment: cannot submit with unanswered questions; review step
      shows every answer before submit; result screen shows the correct
      pass/fail message against the configured pass score.
- [ ] Retake logic: after exhausting max attempts, or within the cooldown
      window, the learner sees the correct blocked message instead of a
      retake option.
- [ ] Admin login works with the default credentials; changing the password
      takes effect immediately (old password stops working, new one works).
- [ ] Admin Settings changes (pass score / attempts / cooldown) actually
      change assessment behavior for a new attempt.
- [ ] Admin Contact Directory changes appear on the learner-facing
      Communication & Emergency Contacts screen without a deployment.
- [ ] CSV export opens correctly in Excel/Sheets and matches the on-screen
      learner table.
- [ ] No layout breakage at common phone widths (360–414px) and on a
      standard laptop width.
- [ ] SME review of the Hindi and Marathi narration scripts (see project
      docs) is completed *before* those languages are wired into the app or
      recorded as voiceover — both documents carry an explicit
      not-yet-validated disclaimer.

## 8. Known limitations / what's proposed, not yet built

- **Hindi and Marathi are not yet in the running app.** The content and
  narration scripts are complete and stored as project documents, but the
  React `content/hi.js` and `content/mr.js` files, the language switcher's
  data wiring, and full-flow testing in those languages are the next
  increment. English is fully functional and tested.
- **Voiceover audio** is not recorded; the current "Read aloud" button uses
  the browser's built-in speech synthesis as a functional placeholder, per
  the project's cost-conscious pilot approach. Recorded professional
  voiceover (per the multilingual narration scripts) is a future addition
  that does not require any app changes to adopt — the read-aloud component
  can be swapped for an `<audio>` player.
- **Images**: the pilot reuses the 6 images from the original source
  deck (confirmed cleared for use by the project owner). No new photography
  has been commissioned.
- **CORS is wide open** (`*`) for ease of pilot testing — tighten this to
  the real frontend origin before a broader rollout.
- **No automated unit/regression test suite** is included yet — testing to
  date is manual/scripted end-to-end browser verification (see Section 6).
  For ongoing maintenance beyond the pilot, adding a small Vitest/Jest suite
  around `server/quizData.js`'s scoring logic and the eligibility state
  machine would be worthwhile, since that logic is the most consequential
  to get right.
- **Assessment question bank** is the original 10 questions only, per the
  project decision to keep scope to the existing bank for this pilot.
- Two ambiguous/borderline quiz questions (an abiotic-factor question and an
  "Operation Coordinator" wording question) were reviewed and intentionally
  left as-is per explicit project sign-off — see the Content Analysis and
  Transformation Plan doc, Section 10 (Decisions Log), for the reasoning.

## 9. Default credentials (change before real use)

- **Admin panel**: username `admin`, password `ChangeMe123` — change this
  immediately from the Settings tab after first login.

## 10. Recommendations for future LMS/SCORM integration

- The clean content/logic/data separation (Section 5) means the *content*
  built here can be reused largely as-is if a future phase wraps it in a
  SCORM 1.2/2004 shim or reports progress via xAPI to SuccessFactors — the
  React screens would need a thin adapter layer to call `LMSSetValue`/xAPI
  statements instead of (or in addition to) this app's own `/api/progress`
  and `/api/quiz/*` endpoints, but the screens and content would not need to
  change.
- If SuccessFactors becomes the system of record for completion, the
  learner-identification model would need to change from
  Employee-ID-only to whatever SF's SSO/launch mechanism provides (typically
  an SF user ID passed at launch) — this is a scoped, well-understood change
  when that phase begins.
