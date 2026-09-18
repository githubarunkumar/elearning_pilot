import { useLearner } from '../LearnerContext.jsx';
import { LANGUAGE_LIST } from '../content/index.js';

export default function Shell({ children, moduleLabel, current, total }) {
  const { content, langCode, setLanguage, learner } = useLearner();
  const pct = total ? Math.round((current / total) * 100) : 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">ACG · Safety &amp; Environment</div>
        <div style={{ flex: 1 }}>
          {moduleLabel && (
            <div className="progress-label">
              {content.ui.progress(moduleLabel, current, total)}
              <div className="progress-bar-track" style={{ maxWidth: 220 }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="lang-switcher">
          <select
            value={langCode}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label={content.ui.languageLabel}
          >
            {LANGUAGE_LIST.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
