import API from './axios';

export const uploadDocument = (formData, token) =>
  API.post('/documents/upload', formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  });

export const getDocuments = (token) =>
  API.get('/documents', { headers: { Authorization: `Bearer ${token}` } });

export const askQuestion = (documentId, question, token) =>
  API.post(`/documents/${documentId}/ask`, { question }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const generateQuiz = (documentId, numQuestions, token) =>
  API.post(`/documents/${documentId}/quiz`, { numQuestions }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getQuizzes = (token) =>
  API.get('/documents/quizzes/all', { headers: { Authorization: `Bearer ${token}` } });

export const getQuizById = (quizId, token) =>
  API.get(`/documents/quiz/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });

export const deleteDocument = (documentId, token) =>
  API.delete(`/documents/${documentId}`, { headers: { Authorization: `Bearer ${token}` } });

export const deleteQuiz = (quizId, token) =>
  API.delete(`/documents/quiz/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });