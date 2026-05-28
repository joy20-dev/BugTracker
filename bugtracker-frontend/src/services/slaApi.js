import api from '../api';

const slaApi = {
  // SLA Tracking APIs
  getSLAStatus: async (ticketId, slaType) => {
    const response = await api.get(`/v1/sla/tracking/ticket/${ticketId}/sla/${slaType}`);
    return response.data;
  },

  getTicketSLAs: async (ticketId) => {
    const response = await api.get(`/v1/sla/tracking/ticket/${ticketId}`);
    return response.data;
  },

  pauseSLA: async (ticketId, slaType, reason) => {
    const response = await api.post(`/v1/sla/tracking/pause`, {
      ticket_id: ticketId,
      sla_type: slaType,
      reason,
    });
    return response.data;
  },

  resumeSLA: async (ticketId, slaType) => {
    const response = await api.post(`/v1/sla/tracking/resume`, {
      ticket_id: ticketId,
      sla_type: slaType,
    });
    return response.data;
  },

  // SLA Policy APIs
  getPoliciesByProjectId: async (projectId) => {
    const response = await api.get(`/v1/sla/policies/project/${projectId}`);
    return response.data;
  },

  createPolicy: async (policyData) => {
    const response = await api.post(`/v1/sla/policies`, policyData);
    return response.data;
  },

  updatePolicy: async (policyId, updateData) => {
    const response = await api.put(`/v1/sla/policies/${policyId}`, updateData);
    return response.data;
  },

  deletePolicy: async (policyId) => {
    const response = await api.delete(`/v1/sla/policies/${policyId}`);
    return response.data;
  },

  initializeDefaultPolicies: async (projectId) => {
    const response = await api.post(`/v1/sla/policies/project/${projectId}/initialize-defaults`);
    return response.data;
  },

  // SLA Breach APIs
  getBreachesByTicketId: async (ticketId) => {
    const response = await api.get(`/v1/sla/breaches/ticket/${ticketId}`);
    return response.data;
  },

  getUnacknowledgedBreaches: async () => {
    const response = await api.get(`/v1/sla/breaches/unacknowledged`);
    return response.data;
  },

  acknowledgeBreach: async (breachId, acknowledgmentNotes) => {
    const response = await api.put(`/v1/sla/breaches/${breachId}/acknowledge`, {
      acknowledgment_notes: acknowledgmentNotes,
    });
    return response.data;
  },

  // SLA Metrics APIs
  getProjectMetrics: async (projectId) => {
    const response = await api.get(`/v1/sla/metrics/project/${projectId}`);
    return response.data;
  },

  getAggregateMetrics: async () => {
    const response = await api.get(`/v1/sla/metrics/aggregate`);
    return response.data;
  },
};

export default slaApi;
