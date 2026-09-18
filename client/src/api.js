// Thin wrapper around the backend API. Base URL is configurable via VITE_API_URL
// (see .env.example) so the same build can point at different deployments.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  // IMPORTANT: spread `rest` first, then set `headers` last. Object spread
  // only overwrites keys that exist on the spread source, so if `headers`
  // were spread from `options` after this object's own `headers` key, any
  // call that passes both a custom header (e.g. an admin Authorization
  // header) AND a body would silently lose the Content-Type header - the
  // request would go out as text/plain, Express's json() body-parser would
  // skip it, and req.body would arrive empty. That previously caused admin
  // Settings/Contacts saves and password changes to silently no-op while
  // still reporting success in the UI.
  const { headers, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Request failed');
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  createOrFindLearner: (payload) => request('/api/learners', { method: 'POST', body: JSON.stringify(payload) }),
  getLearner: (id) => request(`/api/learners/${id}`),
  markProgress: (learnerId, screenId, module) =>
    request('/api/progress', { method: 'POST', body: JSON.stringify({ learnerId, screenId, module }) }),
  getPractice: (mod) => request(`/api/quiz/practice/${mod}`),
  checkAnswer: (id, selectedOriginalIndex) =>
    request('/api/quiz/check', { method: 'POST', body: JSON.stringify({ id, selectedOriginalIndex }) }),
  getFinalEligibility: (learnerId) => request(`/api/quiz/final/eligibility/${learnerId}`),
  startFinal: (learnerId) => request(`/api/quiz/final/start/${learnerId}`),
  submitFinal: (learnerId, answers, startedAt) =>
    request('/api/quiz/final/submit', { method: 'POST', body: JSON.stringify({ learnerId, answers, startedAt }) }),
  getSettings: () => request('/api/settings'),
  getContacts: () => request('/api/contacts'),

  adminLogin: (username, password) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  adminAnalytics: (token) => request('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
  adminLearners: (token) => request('/api/admin/learners', { headers: { Authorization: `Bearer ${token}` } }),
  adminLearnersExportUrl: () => `${BASE}/api/admin/learners/export.csv`,
  adminUpdateSettings: (token, payload) =>
    request('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  adminContactsRaw: (token) => request('/api/admin/contacts-raw', { headers: { Authorization: `Bearer ${token}` } }),
  adminUpdateContacts: (token, payload) =>
    request('/api/admin/contacts', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  adminChangePassword: (token, newPassword) =>
    request('/api/admin/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newPassword }),
    }),
  adminLogout: (token) => request('/api/admin/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};

export { BASE as API_BASE };
