const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' &&
  window.location?.hostname &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://ai-mystery-room-api-jwxe.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');

let authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('ai_mystery_token') : null;

export function setAuthToken(token) {
  authToken = token;
  if (typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem('ai_mystery_token', token);
    } else {
      localStorage.removeItem('ai_mystery_token');
    }
  }
}

export function getAuthToken() {
  return authToken;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || (data && data.success === false)) {
    const message = data?.error?.message || `API request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = data?.error?.code || 'API_ERROR';
    error.fields = data?.error?.fields || {};
    throw error;
  }

  return data;
}

// Case endpoints
export async function getCases(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const json = await request(`/cases${query}`, { method: 'GET' });
  return json.data?.cases || [];
}

export async function getCase(caseId) {
  const json = await request(`/cases/${caseId}`, { method: 'GET' });
  return json.data?.case;
}

export async function createCase({ scenario, category = 'theft', difficulty = 'medium', length = 'standard' }) {
  const json = await request('/cases', {
    method: 'POST',
    body: { scenario, category, difficulty, length },
  });
  return json.data?.case;
}

export async function deleteCase(caseId) {
  const json = await request(`/cases/${caseId}`, { method: 'DELETE' });
  return json.data;
}

export async function getProgress(caseId) {
  const json = await request(`/cases/${caseId}/progress`, { method: 'GET' });
  return json.data?.progress;
}

export async function updateProgress(caseId, { openedEvidenceId, notes } = {}) {
  const json = await request(`/cases/${caseId}/progress`, {
    method: 'PATCH',
    body: { openedEvidenceId, notes },
  });
  return json.data?.progress;
}

export async function submitAccusation(caseId, { suspectId, reasoning = '' } = {}) {
  const json = await request(`/cases/${caseId}/accusations`, {
    method: 'POST',
    body: { suspectId, reasoning },
  });
  return json.data;
}

export async function getResult(caseId) {
  const json = await request(`/cases/${caseId}/result`, { method: 'GET' });
  return json.data?.result;
}

// Authentication endpoints
export async function signup({ username, password, name }) {
  const json = await request('/auth/signup', {
    method: 'POST',
    body: { username, password, name },
  });
  if (json.data?.token) {
    setAuthToken(json.data.token);
  }
  return json.data;
}

export async function login({ username, password }) {
  const json = await request('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
  if (json.data?.token) {
    setAuthToken(json.data.token);
  }
  return json.data;
}

export async function getMe() {
  const json = await request('/auth/me', { method: 'GET' });
  return json.data?.user;
}

export async function updateWalkthrough(hasCompletedWalkthrough = true) {
  const json = await request('/auth/walkthrough', {
    method: 'PATCH',
    body: { hasCompletedWalkthrough },
  });
  return json.data;
}
