import { useEffect, useState } from 'react';
import { api } from '../api.js';

const TOKEN_KEY = 'acg_admin_token';

function useAdminToken() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const setToken = (t) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    setTokenState(t);
  };
  return [token, setToken];
}

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const { token } = await api.adminLogin(username, password);
      onLogin(token);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '80px auto' }} className="card">
      <h2>Admin Login</h2>
      <p style={{ fontSize: '0.85rem', color: '#666' }}>
        Default pilot credentials: <code>admin</code> / <code>ChangeMe123</code> — change this immediately after first login (see Settings tab).
      </p>
      <form onSubmit={submit} className="intake-form">
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="error-text">{err}</div>}
        <div className="btn-row">
          <button className="btn" disabled={busy} type="submit">{busy ? '…' : 'Log In'}</button>
        </div>
      </form>
    </div>
  );
}

function AnalyticsTab({ token }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.adminAnalytics(token).then(setData); }, [token]);
  if (!data) return <p>Loading…</p>;
  const tiles = [
    ['Total Learners', data.totalLearners],
    ['Not Started', data.notStarted],
    ['In Progress', data.inProgress],
    ['Completed', data.completed],
    ['Completion Rate', `${data.completionRatePercent}%`],
    ['Final Attempts', data.totalFinalAttempts],
    ['Avg Final Score', `${data.averageFinalScorePercent}%`],
  ];
  return (
    <div className="stat-grid">
      {tiles.map(([label, val]) => (
        <div className="stat-tile" key={label}>
          <div className="num">{val}</div>
          <div className="lbl">{label}</div>
        </div>
      ))}
    </div>
  );
}

function LearnersTab({ token }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.adminLearners(token).then(setRows); }, [token]);
  return (
    <div className="card">
      <div className="btn-row">
        <a className="btn secondary small" href={api.adminLearnersExportUrl()} target="_blank" rel="noreferrer">
          Export CSV
        </a>
      </div>
      {!rows ? (
        <p>Loading…</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp ID</th><th>Name</th><th>Email</th><th>Lang</th><th>Screens</th><th>Attempts</th><th>Best %</th><th>Status</th><th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.empId}>
                  <td>{r.empId}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.language}</td>
                  <td>{r.screensCompleted}</td>
                  <td>{r.finalAttempts}</td>
                  <td>{r.bestScorePercent}</td>
                  <td>{r.status}</td>
                  <td>{new Date(r.lastSeenAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ token }) {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => { api.getSettings().then(setSettings); }, []);

  async function save() {
    await api.adminUpdateSettings(token, settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changePw(e) {
    e.preventDefault();
    try {
      await api.adminChangePassword(token, newPassword);
      setPwMsg('Password changed.');
      setNewPassword('');
    } catch (e2) {
      setPwMsg(e2.message);
    }
  }

  if (!settings) return <p>Loading…</p>;

  return (
    <div>
      <div className="card intake-form">
        <h3>Assessment Settings</h3>
        <label>Passing score (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={settings.passScorePercent}
          onChange={(e) => setSettings({ ...settings, passScorePercent: e.target.value })}
        />
        <label>Max attempts</label>
        <input
          type="number"
          min="1"
          value={settings.maxAttempts}
          onChange={(e) => setSettings({ ...settings, maxAttempts: e.target.value })}
        />
        <label>Cooldown between retakes (minutes)</label>
        <input
          type="number"
          min="0"
          value={settings.cooldownMinutes}
          onChange={(e) => setSettings({ ...settings, cooldownMinutes: e.target.value })}
        />
        <div className="btn-row">
          <button className="btn" onClick={save}>Save Settings</button>
          {saved && <span style={{ color: 'var(--acg-green)', alignSelf: 'center' }}>Saved ✓</span>}
        </div>
      </div>

      <form className="card intake-form" onSubmit={changePw}>
        <h3>Change Admin Password</h3>
        <label>New password (min 8 characters)</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        {pwMsg && <p style={{ fontSize: '0.85rem' }}>{pwMsg}</p>}
        <div className="btn-row">
          <button className="btn" type="submit">Change Password</button>
        </div>
      </form>
    </div>
  );
}

function ContactsTab({ token }) {
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.adminContactsRaw(token).then(setData); }, [token]);

  function updateRow(cat, idx, field, value) {
    setData((d) => {
      const next = { ...d, [cat]: [...d[cat]] };
      next[cat][idx] = { ...next[cat][idx], [field]: value };
      return next;
    });
  }
  function addRow(cat) {
    setData((d) => ({ ...d, [cat]: [...d[cat], { label: '', value: '' }] }));
  }
  function removeRow(cat, idx) {
    setData((d) => ({ ...d, [cat]: d[cat].filter((_, i) => i !== idx) }));
  }
  async function save() {
    await api.adminUpdateContacts(token, data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!data) return <p>Loading…</p>;

  return (
    <div className="card">
      <h3>Emergency Contact Directory</h3>
      <p style={{ fontSize: '0.85rem', color: '#666' }}>
        Owned by HR per the project decision — editable here without a code deployment. Shown to learners on the
        Communication &amp; Emergency Contacts screen.
      </p>
      {['security', 'fire', 'medical'].map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <h4 style={{ textTransform: 'capitalize' }}>{cat}</h4>
          {data[cat].map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                placeholder="Label"
                value={row.label}
                onChange={(e) => updateRow(cat, i, 'label', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                placeholder="Value / number"
                value={row.value}
                onChange={(e) => updateRow(cat, i, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn ghost small" type="button" onClick={() => removeRow(cat, i)}>✕</button>
            </div>
          ))}
          <button className="btn secondary small" type="button" onClick={() => addRow(cat)}>+ Add</button>
        </div>
      ))}
      <div className="btn-row">
        <button className="btn" onClick={save}>Save Contacts</button>
        {saved && <span style={{ color: 'var(--acg-green)', alignSelf: 'center' }}>Saved ✓</span>}
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [token, setToken] = useAdminToken();
  const [tab, setTab] = useState('analytics');

  if (!token) return <LoginForm onLogin={setToken} />;

  return (
    <div className="app-main" style={{ maxWidth: 1000 }}>
      <div className="app-header" style={{ margin: '-20px -16px 20px', borderRadius: 0 }}>
        <div className="brand">ACG Admin</div>
        <button className="btn ghost small" onClick={() => { api.adminLogout(token).catch(() => {}); setToken(null); }}>
          Log Out
        </button>
      </div>
      <div className="admin-nav">
        {[
          ['analytics', 'Analytics'],
          ['learners', 'Learners'],
          ['settings', 'Settings'],
          ['contacts', 'Contact Directory'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`btn secondary small ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'analytics' && <AnalyticsTab token={token} />}
      {tab === 'learners' && <LearnersTab token={token} />}
      {tab === 'settings' && <SettingsTab token={token} />}
      {tab === 'contacts' && <ContactsTab token={token} />}
    </div>
  );
}
