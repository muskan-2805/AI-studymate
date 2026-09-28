import API from './axios';

export const logRevision = (documentId, score, token) =>
  API.post('/revision/log', { documentId, score }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTodayRevisions = (token) =>
  API.get('/revision/today', { headers: { Authorization: `Bearer ${token}` } });

export const getAllRevisionLogs = (token) =>
  API.get('/revision/all', { headers: { Authorization: `Bearer ${token}` } });