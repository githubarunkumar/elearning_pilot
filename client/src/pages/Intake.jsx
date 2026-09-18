import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearner } from '../LearnerContext.jsx';
import { api } from '../api.js';
import LANGUAGES, { LANGUAGE_LIST } from '../content/index.js';

export default function Intake() {
  const { login } = useLearner();
  const navigate = useNavigate();
  const [form, setForm] = useState({ empId: '', name: '', email: '', language: 'en' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const t = LANGUAGES[form.language].intake;
  const ui = LANGUAGES[form.language].ui;

  function validate() {
    const e = {};
    if (!form.empId.trim()) e.empId = t.errRequired;
    if (!form.name.trim()) e.name = t.errRequired;
    if (!form.email.trim()) e.email = t.errRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.errEmail;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const { learner, resumed } = await api.createOrFindLearner(form);
      login(learner);
      navigate(resumed ? '/welcome' : '/welcome');
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-main" style={{ maxWidth: 480, margin: '40px auto' }}>
      <div className="card">
        <h2 className="screen-title" style={{ color: 'var(--acg-red)' }}>ACG</h2>
        <p>{t.heading}</p>
        <p style={{ color: '#555' }}>{t.sub}</p>
        <form className="intake-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="empId">{t.empId} *</label>
          <input id="empId" value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })} />
          {errors.empId && <div className="error-text">{errors.empId}</div>}

          <label htmlFor="name">{t.name} *</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <div className="error-text">{errors.name}</div>}

          <label htmlFor="email">{t.email} *</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}

          <label htmlFor="language">{t.language}</label>
          <select id="language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            {LANGUAGE_LIST.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {apiError && <div className="error-text" style={{ marginTop: 10 }}>{apiError}</div>}

          <div className="btn-row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? '…' : ui.startBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
