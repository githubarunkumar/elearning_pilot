import { useNavigate } from 'react-router-dom';
import { useLearner } from '../LearnerContext.jsx';
import Shell from '../components/Shell.jsx';
import ReadAloud from '../components/ReadAloud.jsx';
import { useEffect } from 'react';

export default function Welcome() {
  const { content, markProgress } = useLearner();
  const navigate = useNavigate();
  const t = content.welcome;

  useEffect(() => { markProgress('s1', 'intro'); }, [markProgress]);

  return (
    <Shell>
      <div className="card" style={{ textAlign: 'center', background: 'var(--acg-ink)', color: 'white' }}>
        <h1 className="screen-title" style={{ color: 'white' }}>{t.title}</h1>
        <p className="screen-subtitle" style={{ color: '#ddd' }}>{t.subtitle}</p>
      </div>
      <ReadAloud text={t.narration} />
      <div className="card">
        <p>{t.body}</p>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => navigate('/objectives')}>
          {t.button}
        </button>
      </div>
    </Shell>
  );
}
