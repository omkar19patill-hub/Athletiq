import api from '../api/axiosInstance';

export const venueService = {
  getAll: (params) => api.get('/venues', { params }),
  search: (params) => api.get('/venues/search', { params }),
  getNearby: (params) => api.get('/venues/nearby', { params }),
  lookupPincode: (pincode) => api.get('/venues/pincode/lookup', { params: { pincode } }),
  getFeatured: () => api.get('/venues/featured'),
  getCities: () => api.get('/venues/cities'),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
};

export const courtService = {
  getByVenue: (venueId) => api.get(`/courts/venue/${venueId}`),
  getById: (id) => api.get(`/courts/${id}`),
  create: (data) => api.post('/courts', data),
  update: (id, data) => api.put(`/courts/${id}`, data),
  delete: (id) => api.delete(`/courts/${id}`),
};

export const slotService = {
  getByCourtAndDate: (courtId, date) => api.get(`/slots/court/${courtId}`, { params: { date } }),
  create: (data) => api.post('/slots', data),
  bulkCreate: (data) => api.post('/slots/bulk', data),
  block: (id) => api.patch(`/slots/${id}/block`),
  unblock: (id) => api.patch(`/slots/${id}/unblock`),
  delete: (id) => api.delete(`/slots/${id}`),
};

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  cancel: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getAllBookings: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByNumber: (number) => api.get(`/bookings/number/${number}`),
  // Backend reads status from the query string (@RequestParam), not the body
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, null, { params: { status } }),
  accept: (id) => api.post(`/bookings/${id}/accept`),
  reject: (id, reason) => api.post(`/bookings/${id}/reject`, null, { params: { reason } }),
  saveRequirement: (data) => api.post('/booking-requirements', data),
  getRequirement: (bookingId) => api.get(`/booking-requirements/booking/${bookingId}`),
};

export const reviewService = {
  add: (data) => api.post('/reviews', data),
  getByVenue: (venueId, params) => api.get(`/reviews/venue/${venueId}`, { params }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const favouriteService = {
  toggle: (venueId) => api.post(`/favourites/${venueId}`),
  check: (venueId) => api.get(`/favourites/${venueId}/check`),
  getMyFavourites: (params) => api.get('/favourites', { params }),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  toggleBlock: (id) => api.patch(`/users/${id}/block`),
  delete: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
};

export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getCustomerStats: () => api.get('/dashboard/customer'),
};

export const paymentService = {
  getConfig: () => api.get('/payments/config'),
  confirm: (bookingNumber) => api.post(`/payments/confirm/${bookingNumber}`),
};

