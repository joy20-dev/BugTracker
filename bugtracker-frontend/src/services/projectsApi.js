import api from '../api';

const projectsApi = {
  // Project APIs
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // User-Project Mapping APIs
  assignUserToProject: async (projectId, userId) => {
    const response = await api.put(`/projects/${projectId}/users/${userId}`);
    return response.data;
  },
};

export default projectsApi;
