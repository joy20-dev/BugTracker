import axios from 'axios';

const API_BASE_URL = 'https://laughing-spoon-wvrrwv9v4rqrhxr7-8080.app.github.dev/api/v1';

const slaApi = {
  // SLA Tracking APIs
  getSLAStatus: async (ticketId, slaType) => {
    const response = await axios.get(`${API_BASE_URL}/sla/tracking/ticket/${ticketId}/sla/${slaType}`);
    return response.data;
  },

  getTicketSLAs: async (ticketId) => {
    const response = await axios.get(`${API_BASE_URL}/sla/tracking/ticket/${ticketId}`);
    return response.data;
  },

  pauseSLA: async (ticketId, slaType, reason) => {
    const response = await axios.post(`${API_BASE_URL}/sla/tracking/pause`, {
      ticket_id: ticketId,
      sla_type: slaType,
      reason,
    });
    return response.data;
  },

  resumeSLA: async (ticketId, slaType) => {
    const response = await axios.post(`${API_BASE_URL}/sla/tracking/resume`, {
      ticket_id: ticketId,
      sla_type: slaType,
    });
    return response.data;
  },

  // SLA Policy APIs
  getPoliciesByProjectId: async (projectId) => {
    const response = await axios.get(`${API_BASE_URL}/sla/policies/project/${projectId}`);
    return response.data;
  },

  createPolicy: async (policyData) => {
    const response = await axios.post(`${API_BASE_URL}/sla/policies`, policyData);
    return response.data;
  },

  updatePolicy: async (policyId, updateData) => {
    const response = await axios.put(`${API_BASE_URL}/sla/policies/${policyId}`, updateData);
    return response.data;
  },

  deletePolicy: async (policyId) => {
    const response = await axios.delete(`${API_BASE_URL}/sla/policies/${policyId}`);
    return response.data;
  },

  initializeDefaultPolicies: async (projectId) => {
    const response = await axios.post(`${API_BASE_URL}/sla/policies/project/${projectId}/initialize-defaults`);
    return response.data;
  },

  // SLA Breach APIs
  getBreachesByTicketId: async (ticketId) => {
    const response = await axios.get(`${API_BASE_URL}/sla/breaches/ticket/${ticketId}`);
    return response.data;
  },

  getUnacknowledgedBreaches: async () => {
    const response = await axios.get(`${API_BASE_URL}/sla/breaches/unacknowledged`);
    return response.data;
  },

  acknowledgeBreach: async (breachId, acknowledgmentNotes) => {
    const response = await axios.put(`${API_BASE_URL}/sla/breaches/${breachId}/acknowledge`, {
      acknowledgment_notes: acknowledgmentNotes,
    });
    return response.data;
  },

  // SLA Metrics APIs
  getProjectMetrics: async (projectId) => {
    const response = await axios.get(`${API_BASE_URL}/sla/metrics/project/${projectId}`);
    return response.data;
  },
};

export default slaApi;
