import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../LearnerContext.jsx';
import Shell from '../components/Shell.jsx';
import ReadAloud from '../components/ReadAloud.jsx';
import { FinalQuiz } from '../components/Quiz.jsx';
import { api } from '../api.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Assessment() {
  const { content, learner } = useLearner();
  const navigate = useNavigate();
  const t = content.faS1;
  const [phase, setPhase] = useState('loading'); // loading | blocked | instructions | quiz | result
  const [elig, setElig] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [result, setResult] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getFinalEligibility(learner.id)
      .then((e) => {
        setElig(e);
        setPhase(e.eligible ? 'instructions' : 'blocked');
      })
      .catch((err) => setError(err.message));
  }, [learner.id]);

  async function begin() {
    try {
      const data = await api.startFinal(learner.id);
      setQuestions(data.questions);
      setStartedAt(new Date().toISOString());
      setPhase('quiz');
    } catch (err) {
      setError(err.data?.reason ? null : err.message);
      setElig(err.data || elig);
      setPhase('blocked');
    }
  }

  async function handleSubmit(answers) {
    try {
      const res = await api.submitFinal(learner.id, answers, startedAt);
      setResult(res);
      setPhase('result');
    } catch (err) {
      setError(err.message);
    }
  }

  if (phase === 'loading') return <Shell><p>Loading…</p></Shell>;

  if (phase === 'blocked') {
    return (
      <Shell>
        <h1 className="screen-title">{t.title}</h1>
        <div className="card">
          {elig?.reason === 'already_passed' && <p>{t.notEligibleAlreadyPassed}</p>}
          {elig?.reason === 'attempts_exhausted' && <p>{t.notEligibleExhausted}</p>}
          {elig?.reason === 'cooldown' && <p>{t.notEligibleCooldown(formatDate(elig.retryAt))}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="btn-row">
          <button className="btn" onClick={() => navigate('/complete')}>{t.goToCompletion}</button>
        </div>
      </Shell>
    );
  }

  if (phase === 'instructions') {
    return (
      <Shell>
        <h1 className="screen-title">{t.title}</h1>
        <ReadAloud text={t.narration} />
        <div className="panel">
          <p>{t.passLabel} <strong>{elig.settings.passScorePercent}%</strong></p>
          <p>{t.attemptsLabel} <strong>{elig.settings.maxAttempts}</strong></p>
          <p>{t.cooldownLabel} <strong>{elig.settings.cooldownMinutes} min</strong></p>
          <p>{t.attemptsRemainingLabel} <strong>{elig.attemptsRemaining}</strong></p>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={begin}>{t.button}</button>
        </div>
      </Shell>
    );
  }

  if (phase === 'quiz') {
    return (
      <Shell>
        <h1 className="screen-title">{content.faS2.title}</h1>
        <FinalQuiz questions={questions} onSubmit={handleSubmit} />
      </Shell>
    );
  }

  if (phase === 'result') {
    const r3 = content.faS3;
    return (
      <Shell>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 className="screen-title">{result.passed ? r3.passTitle : r3.failTitle}</h1>
          {result.passed ? (
            <p>{r3.passMsg(result.percent)}</p>
          ) : (
            <>
              <p>{r3.failMsg(result.percent, result.passScorePercent)}</p>
              {result.exhausted && <p>{r3.exhaustedMsg}</p>}
              {!result.exhausted && result.retryAt && <p>{r3.cooldownMsg(formatDate(result.retryAt))}</p>}
              {!result.exhausted && !result.retryAt && <p>{r3.attemptsRemaining(result.attemptsRemaining)}</p>}
            </>
          )}
        </div>
        <details className="card">
          <summary>{r3.reviewLabel}</summary>
          {result.detail.map((d, i) => (
            <p key={i} className={d.correct ? 'feedback-box correct' : 'feedback-box incorrect'}>
              {d.correct ? '✅' : '❌'} {d.explanation}
            </p>
          ))}
        </details>
        <div className="btn-row">
          {result.passed ? (
            <button className="btn" onClick={() => navigate('/complete')}>{r3.continueBtn}</button>
          ) : (
            <button className="btn" onClick={() => window.location.reload()}>{r3.retryBtn}</button>
          )}
        </div>
      </Shell>
    );
  }

  return null;
}
