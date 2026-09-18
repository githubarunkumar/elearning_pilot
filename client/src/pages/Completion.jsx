import { useEffect, useState } from 'react';
import { useLearner } from '../LearnerContext.jsx';
import Shell from '../components/Shell.jsx';
import ReadAloud from '../components/ReadAloud.jsx';
import { api } from '../api.js';

export default function Completion() {
  const { content, learner } = useLearner();
  const t = content.faS4;
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.getLearner(learner.id).then(setDetail).catch(() => {});
  }, [learner.id]);

  const passedAttempt = detail?.attempts?.find((a) => a.attempt_type === 'final' && a.passed);
  const percent = passedAttempt ? Math.round((passedAttempt.score / passedAttempt.total) * 100) : null;
  const date = passedAttempt ? new Date(passedAttempt.submitted_at).toLocaleDateString() : '—';

  function download() {
    const lines = [
      'ACG Safety & Environmental Awareness Training',
      'Completion Record',
      '-----------------------------------------',
      `Employee ID: ${learner.emp_id}`,
      `Name: ${learner.name}`,
      `Email: ${learner.email}`,
      `Completed: ${date}`,
      `Score: ${percent !== null ? percent + '%' : 'N/A'}`,
      '',
      t.tagline,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completion_${learner.emp_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="screen-title">🎉 {t.title}</h1>
        <ReadAloud text={t.narration} />
        <p>
          <strong>{learner.name}</strong> · {learner.emp_id}
          <br />
          {date} · {percent !== null ? `${percent}%` : ''}
        </p>
        <p className="callout">{t.tagline}</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={download}>{t.downloadBtn}</button>
        </div>
      </div>
    </Shell>
  );
}
