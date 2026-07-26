import { apiClient } from './client';

export const api = {
  login: (userId: string, password: string) =>
    apiClient.post('/auth/login', { userId, password }),

  getSubjects: () => apiClient.get('/subjects'),
  getTopicsBySubject: (subjectId: string) =>
    apiClient.get(`/topics/subject/${subjectId}`),
  getSubTopicsByTopic: (topicId: string) =>
    apiClient.get(`/sub-topics/topic/${topicId}`),
  getSubTopicsByTopics: (topicIds: string[]) =>
    apiClient.post('/sub-topics/multi-topics', { topicIds }),

  getTests: () => apiClient.get('/tests'),
  getTestById: (id: string) => apiClient.get(`/tests/${id}`),
  createTest: (data: any) => apiClient.post('/tests', data),
  updateTest: (id: string, data: any) => apiClient.put(`/tests/${id}`, data),
  publishTest: (id: string) => apiClient.put(`/tests/${id}`, { status: 'live' }),

  bulkCreateQuestions: (questions: any[]) =>
    apiClient.post('/questions/bulk', { questions }),
  fetchBulkQuestions: (questionIds: string[]) =>
    apiClient.post('/questions/fetchBulk', { question_ids: questionIds }),
};
