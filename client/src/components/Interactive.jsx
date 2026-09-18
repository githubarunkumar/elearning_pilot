import { useEffect, useState } from 'react';
import { api } from '../api.js';

// ---------------------------------------------------------------------------
// Flip cards (M1-S1: Biotic / Abiotic)
// ---------------------------------------------------------------------------
export function FlipCards({ cards }) {
  const [open, setOpen] = useState({});
  return (
    <div className="hotspot-grid">
      {cards.map((c) => (
        <button
          key={c.label}
          type="button"
          className={`hotspot-btn ${open[c.label] ? 'active' : ''}`}
          onClick={() => setOpen((o) => ({ ...o, [c.label]: !o[c.label] }))}
          aria-expanded={!!open[c.label]}
        >
          {c.label}
          {open[c.label] && <div className="hotspot-detail">{c.text}</div>}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hotspot diagram (M1-S2: Air/Water/Soil/Noise)
// ---------------------------------------------------------------------------
export function HotspotGroup({ categories, onAllOpened }) {
  const [open, setOpen] = useState({});
  useEffect(() => {
    const allOpen = categories.every((c) => open[c.key]);
    if (allOpen) onAllOpened?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="hotspot-grid">
      {categories.map((c) => (
        <button
          key={c.key}
          type="button"
          className={`hotspot-btn ${open[c.key] ? 'active' : ''}`}
          onClick={() => setOpen((o) => ({ ...o, [c.key]: true }))}
        >
          {c.label}
          {open[c.key] && <div className="hotspot-detail">{c.detail}</div>}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Waste sorter (M1-S3) - tap-to-select-then-tap-to-place (accessible, works on
// touch and mouse without needing HTML5 drag-and-drop, per design spec Section 3)
// ---------------------------------------------------------------------------
export function WasteSorter({ items, labels, disposalNote, correctMsg, incorrectMsg, onAllSorted }) {
  const [selected, setSelected] = useState(null);
  const [sorted, setSorted] = useState({}); // id -> 'hazardous' | 'nonhazardous'
  const [flash, setFlash] = useState(null); // { id, ok }

  const remaining = items.filter((it) => !sorted[it.id]);

  function place(bin) {
    if (!selected) return;
    const item = items.find((i) => i.id === selected);
    const ok = item.category === bin;
    setFlash({ id: item.id, ok });
    if (ok) {
      setSorted((s) => {
        const next = { ...s, [item.id]: bin };
        if (Object.keys(next).length === items.length) onAllSorted?.();
        return next;
      });
    }
    setSelected(null);
    setTimeout(() => setFlash(null), 900);
  }

  return (
    <div>
      <div className="chip-tray">
        {remaining.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`chip ${selected === it.id ? 'selected' : ''} ${
              flash && flash.id === it.id ? (flash.ok ? 'correct' : 'incorrect') : ''
            }`}
            onClick={() => setSelected(it.id)}
          >
            {it.label}
          </button>
        ))}
        {remaining.length === 0 && <em>All items sorted ✅</em>}
      </div>
      <div className="bins-row">
        <div
          className="bin hazardous"
          role="button"
          tabIndex={0}
          onClick={() => place('hazardous')}
          onKeyDown={(e) => e.key === 'Enter' && place('hazardous')}
        >
          <h4>{labels.hazardousLabel}</h4>
          {items
            .filter((it) => sorted[it.id] === 'hazardous')
            .map((it) => (
              <div key={it.id} className="item">
                {it.label}
              </div>
            ))}
        </div>
        <div
          className="bin nonhazardous"
          role="button"
          tabIndex={0}
          onClick={() => place('nonhazardous')}
          onKeyDown={(e) => e.key === 'Enter' && place('nonhazardous')}
        >
          <h4>{labels.nonHazardousLabel}</h4>
          {items
            .filter((it) => sorted[it.id] === 'nonhazardous')
            .map((it) => (
              <div key={it.id} className="item">
                {it.label}
              </div>
            ))}
        </div>
      </div>
      {flash && (
        <p className={flash.ok ? 'feedback-box correct' : 'feedback-box incorrect'}>
          {flash.ok
            ? correctMsg
            : incorrectMsg(
                items.find((i) => i.id === flash.id)?.label,
                items.find((i) => i.id === flash.id)?.category === 'hazardous' ? labels.hazardousLabel : labels.nonHazardousLabel
              )}
        </p>
      )}
      {Object.keys(sorted).length === items.length && <p className="callout">{disposalNote}</p>}
      <p style={{ fontSize: '0.8rem', color: '#666' }}>Tap an item, then tap the bin you think it belongs in.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Do/Don't scenario check (M1-S4)
// ---------------------------------------------------------------------------
export function ScenarioCheck({ question, options, onAnswered, correctText, incorrectText }) {
  const [choice, setChoice] = useState(null);
  return (
    <div className="panel">
      <strong>{question}</strong>
      <div style={{ marginTop: 10 }}>
        {options.map((opt, i) => (
          <div
            key={i}
            className={`mcq-option ${choice === i ? (opt.correct ? 'correct' : 'incorrect') : ''}`}
            onClick={() => {
              setChoice(i);
              onAnswered?.(opt.correct);
            }}
          >
            {opt.text}
          </div>
        ))}
      </div>
      {choice !== null && (
        <p className={options[choice].correct ? 'feedback-box correct' : 'feedback-box incorrect'}>
          {options[choice].correct ? correctText : incorrectText}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scenario gallery (M2-S1)
// ---------------------------------------------------------------------------
export function ScenarioGallery({ cards }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="scenario-grid">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`scenario-card ${open === c.key ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setOpen(open === c.key ? null : c.key)}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(open === c.key ? null : c.key)}
        >
          {c.label}
          {open === c.key && <div className="scenario-detail">{c.desc}</div>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Org chart (M2-S2)
// ---------------------------------------------------------------------------
export function OrgChart({ roles }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {roles.map((r, i) => (
        <div
          key={i}
          className={`org-node ${open === i ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setOpen(open === i ? null : i)}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(open === i ? null : i)}
        >
          <div className="role">{r.role}</div>
          <div className="who">{r.who}</div>
          {open === i && <div className="resp">{r.resp}</div>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sequence builder (M2-S3) - up/down reordering (accessible alternative to drag)
// ---------------------------------------------------------------------------
export function SequenceBuilder({ steps, checkLabel, resetLabel, correctMsg, onSolved }) {
  const [order, setOrder] = useState(() => shuffleOnce(steps));
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  function shuffleOnce(arr) {
    const a = arr.map((s, i) => ({ text: s, originalIndex: i }));
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function move(i, dir) {
    setChecked(false);
    setOrder((o) => {
      const next = [...o];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function check() {
    setChecked(true);
    const ok = order.every((item, idx) => item.originalIndex === idx);
    setSolved(ok);
    if (ok) onSolved?.();
  }

  return (
    <div>
      <ol className="seq-list">
        {order.map((item, i) => (
          <li
            key={item.originalIndex}
            className={`seq-item ${checked ? (item.originalIndex === i ? 'correct' : 'incorrect') : ''}`}
          >
            <span className="seq-num">{i + 1}</span>
            <span style={{ flex: 1 }}>{item.text}</span>
            <span className="seq-arrows">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up">
                ↑
              </button>{' '}
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down">
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="btn-row">
        <button type="button" className="btn secondary small" onClick={check}>
          {checkLabel}
        </button>
        <button type="button" className="btn ghost small" onClick={() => { setOrder(shuffleOnce(steps)); setChecked(false); setSolved(false); }}>
          {resetLabel}
        </button>
      </div>
      {solved && <p className="feedback-box correct">{correctMsg}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Branching scenario (M2-S4)
// ---------------------------------------------------------------------------
export function BranchingChoice({ question, essentialLabel, nonEssentialLabel, essentialOutcome, nonEssentialOutcome, tryOtherLabel }) {
  const [choice, setChoice] = useState(null);
  return (
    <div className="panel">
      <strong>{question}</strong>
      <div className="btn-row">
        <button type="button" className="btn secondary" onClick={() => setChoice('essential')}>
          {essentialLabel}
        </button>
        <button type="button" className="btn secondary" onClick={() => setChoice('nonessential')}>
          {nonEssentialLabel}
        </button>
      </div>
      {choice && (
        <>
          <p className="feedback-box correct">{choice === 'essential' ? essentialOutcome : nonEssentialOutcome}</p>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setChoice(choice === 'essential' ? 'nonessential' : 'essential')}
          >
            {tryOtherLabel}
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cycle diagram (M2-S5)
// ---------------------------------------------------------------------------
export function CycleDiagram({ steps }) {
  const [revealed, setRevealed] = useState(1);
  return (
    <div className="cycle-steps">
      {steps.map((s, i) => (
        <div key={i} className={`cycle-step ${i < revealed ? 'revealed' : ''}`}>
          <span className="cycle-num">{i + 1}</span>
          <div>
            <strong>{s.label}</strong>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>{s.who}</div>
          </div>
        </div>
      ))}
      {revealed < steps.length && (
        <button type="button" className="btn secondary small" style={{ alignSelf: 'flex-start' }} onClick={() => setRevealed((r) => r + 1)}>
          Next step →
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact directory (M2-S6) - data-bound to the admin-editable backend, not hardcoded
// ---------------------------------------------------------------------------
export function ContactDirectory({ categories, note }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.getContacts().then(setData).catch(() => setData({ security: [], fire: [], medical: [] }));
  }, []);
  if (!data) return <p>Loading contacts…</p>;
  return (
    <div>
      {Object.entries(categories).map(([key, label]) => (
        <details className="contact-card" key={key}>
          <summary>{label}</summary>
          {(data[key] || []).map((c, i) => (
            <div className="contact-row" key={i}>
              <span>{c.label}</span>
              <strong>{c.value}</strong>
            </div>
          ))}
        </details>
      ))}
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 8 }}>{note}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// First aid "what would you do" (M2-S7)
// ---------------------------------------------------------------------------
export function FirstAidPrompts({ scenarios, prompt }) {
  const [answers, setAnswers] = useState({});
  return (
    <div>
      {scenarios.map((s, si) => (
        <div className="card" key={si}>
          <strong>{s.situation}</strong>
          <p style={{ margin: '6px 0', fontSize: '0.9rem', color: '#555' }}>{prompt}</p>
          {s.options.map((opt, oi) => {
            const answered = answers[si] !== undefined;
            const isSelected = answers[si] === oi;
            const isCorrect = oi === s.correctIndex;
            let cls = 'mcq-option';
            if (answered && isSelected) cls += isCorrect ? ' correct' : ' incorrect';
            if (answered && isCorrect) cls += ' correct';
            return (
              <div key={oi} className={cls} onClick={() => setAnswers((a) => ({ ...a, [si]: oi }))}>
                {opt}
              </div>
            );
          })}
          {answers[si] !== undefined && s.warning && <div className="warning-badge">⚠ {s.warning}</div>}
        </div>
      ))}
    </div>
  );
}
