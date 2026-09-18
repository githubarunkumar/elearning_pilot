import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useLearner } from '../LearnerContext.jsx';

// ---------------------------------------------------------------------------
// Practice check - ungraded, unlimited attempts, immediate per-question feedback.
// Question/option text comes from the server (authoritative + shuffled); this
// keeps the answer key server-side so it can't be read from client source.
// ---------------------------------------------------------------------------
export function PracticeQuiz({ module, onDone, buttonLabel }) {
  const { content } = useLearner();
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({}); // qid -> { selectedOriginalIndex, result }

  useEffect(() => {
    api.getPractice(module).then((d) => setQuestions(d.questions));
  }, [module]);

  if (!questions) return <p>Loading practice questions…</p>;

  async function select(q, shuffledIndex) {
    const originalIndex = q.optionOrder[shuffledIndex];
    const result = await api.checkAnswer(q.id, originalIndex);
    setAnswers((a) => ({ ...a, [q.id]: { shuffledIndex, result } }));
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div>
      {questions.map((q, qi) => {
        const state = answers[q.id];
        return (
          <div className="card" key={q.id}>
            <strong>
              {qi + 1}. {q.text}
            </strong>
            <div style={{ marginTop: 8 }}>
              {q.options.map((optText, oi) => {
                let cls = 'mcq-option';
                if (state) {
                  const isSelected = state.shuffledIndex === oi;
                  const correctShuffledIdx = q.optionOrder.indexOf(state.result.correctIndex);
                  if (isSelected) cls += state.result.correct ? ' correct' : ' incorrect';
                  if (oi === correctShuffledIdx) cls += ' correct';
                }
                return (
                  <div key={oi} className={cls} onClick={() => select(q, oi)}>
                    {optText}
                  </div>
                );
              })}
            </div>
            {state && (
              <p className={state.result.correct ? 'feedback-box correct' : 'feedback-box incorrect'}>
                {state.result.correct ? '✅ ' : '❌ '}
                {state.result.explanation}
              </p>
            )}
          </div>
        );
      })}
      <div className="btn-row">
        <button type="button" className="btn" disabled={!allAnswered} onClick={onDone}>
          {buttonLabel || content.ui.continueBtn}
        </button>
      </div>
      {!allAnswered && <p style={{ fontSize: '0.85rem', color: '#666' }}>{content.ui.practiceDisclaimer}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Final Assessment - graded, one question per screen, review step, feedback only
// shown after submission (per Visual & Interaction spec, Section 3).
// ---------------------------------------------------------------------------
export function FinalQuiz({ questions, onSubmit }) {
  const { content } = useLearner();
  const t = content.faS2;
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState({}); // qid -> shuffledIndex
  const [reviewing, setReviewing] = useState(false);
  const [warn, setWarn] = useState(false);

  const q = questions[index];
  const total = questions.length;

  function selectOption(oi) {
    setSelections((s) => ({ ...s, [q.id]: oi }));
  }

  function next() {
    if (index < total - 1) setIndex(index + 1);
    else setReviewing(true);
  }
  function back() {
    if (reviewing) setReviewing(false);
    else if (index > 0) setIndex(index - 1);
  }

  function submit() {
    const unanswered = questions.some((qq) => selections[qq.id] === undefined);
    if (unanswered) {
      setWarn(true);
      return;
    }
    const answers = questions.map((qq) => ({
      id: qq.id,
      selectedOriginalIndex: qq.optionOrder[selections[qq.id]],
    }));
    onSubmit(answers);
  }

  if (reviewing) {
    return (
      <div>
        <h3>{t.reviewTitle}</h3>
        {questions.map((qq, i) => (
          <div className="card" key={qq.id}>
            <strong>
              {i + 1}. {qq.text}
            </strong>
            <p style={{ marginTop: 6 }}>
              {selections[qq.id] !== undefined ? (
                <>Your answer: {qq.options[selections[qq.id]]}</>
              ) : (
                <em style={{ color: '#a31e22' }}>Not answered</em>
              )}
            </p>
            <button type="button" className="btn ghost small" onClick={() => { setReviewing(false); setIndex(i); }}>
              Edit
            </button>
          </div>
        ))}
        {warn && <p className="error-text">{t.unansweredWarning}</p>}
        <div className="btn-row">
          <button type="button" className="btn secondary" onClick={back}>
            {t.backBtn}
          </button>
          <button type="button" className="btn" onClick={submit}>
            {t.submitBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="progress-label" style={{ color: '#555' }}>{t.questionLabel(index + 1, total)}</p>
      <div className="card">
        <strong>{q.text}</strong>
        <div style={{ marginTop: 8 }}>
          {q.options.map((optText, oi) => (
            <div
              key={oi}
              className={`mcq-option ${selections[q.id] === oi ? 'selected' : ''}`}
              onClick={() => selectOption(oi)}
            >
              <input type="radio" readOnly checked={selections[q.id] === oi} />
              {optText}
            </div>
          ))}
        </div>
      </div>
      <div className="btn-row">
        {index > 0 && (
          <button type="button" className="btn secondary" onClick={back}>
            {t.backBtn}
          </button>
        )}
        <button type="button" className="btn" disabled={selections[q.id] === undefined} onClick={next}>
          {index === total - 1 ? t.reviewTitle : t.nextBtn}
        </button>
      </div>
    </div>
  );
}
