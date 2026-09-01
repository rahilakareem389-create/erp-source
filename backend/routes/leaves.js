export const leaveAPI = {
  getPending: () =>
    API.get('/leaves/pending'),

  updateStatus: (
    id,
    status,
    reason = ''
  ) =>
    API.put(`/leaves/${id}/status`, {
      status,
      rejectionReason: reason || null,
    }),

  approve: (id) =>
    API.put(`/leaves/${id}/status`, {
      status: 'approved',
    }),

  reject: (id, reason = '') =>
    API.put(`/leaves/${id}/status`, {
      status: 'rejected',
      rejectionReason: reason || null,
    }),

  withdraw: (id) =>
    API.put(`/leaves/${id}/status`, {
      status: 'withdrawn',
    }),

  getMy: () =>
    API.get('/leaves/my'),

  getMyBalance: () =>
    API.get('/leaves/my-balance'),

  getByEmployee: (id) =>
    API.get(`/leaves/employee/${id}`),

  getBalanceByEmployee: (id) =>
    API.get(`/leaves/balance/${id}`),
};