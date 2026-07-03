import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear token and redirect
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ──
export const authAPI = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
}

// ── Products ──
export const productsAPI = {
  getAll: (category) => api.get('/products', { params: category ? { category } : {} }),
  getOne: (id) => api.get(`/products/${id}`),
  addReview: (id, rating, comment) => api.post(`/products/${id}/reviews`, { rating, comment }),
}

// ── Cart ──
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, weightLabel, price, qty) => api.post('/cart', { productId, weightLabel, price, qty }),
  update: (id, qty) => api.put(`/cart/${id}`, { qty }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
}

// ── Orders ──
export const ordersAPI = {
  create: (items, address, total) => api.post('/orders', { items, address, total }),
  getMy: () => api.get('/orders/my'),
  getOne: (id) => api.get(`/orders/${id}`),
}

// ── Users ──
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
}

// ── Admin ──
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Orders
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getLabelUrl: (id) => `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/admin/orders/${id}/label`,

  // Products
  getProducts: () => api.get('/admin/products'),
  createProduct: (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, formData) => api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock`, { stock }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Customers
  getCustomers: () => api.get('/admin/customers'),
  getExportUrl: () => `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/admin/customers/export`,
}

export default api
