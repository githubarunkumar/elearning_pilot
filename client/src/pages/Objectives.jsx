import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../LearnerContext.jsx';
import Shell from '../components/Shell.jsx';
import ReadAloud from '../components/ReadAloud.jsx';

export default function Objectives() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.objectives;

  useEffect(() => { markProgress('s2', 'intro'); }, [markProgress]);

  return (
    <Shell>
      <h1 className="screen-title">{t.title}</h1>
      <ReadAloud text={t.narration} />
      <div className="card">
        <h3>{t.module1Title}</h3>
        <ul>
          {t.module1.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3>{t.module2Title}</h3>
        <ul>
          {t.module2.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => navigate('/module1/1')}>
          {t.button}
        </button>
      </div>
    </Shell>
  );
}
