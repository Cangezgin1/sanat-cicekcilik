import axios from 'axios'

export const BACKEND_URL = 'https://sanat-cicekcilik-backend.onrender.com'

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
})

export const getImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}

export const getProducts = (category) =>
  api.get('/products', { params: category ? { category } : {} }).then(r => r.data)

export const getCategories = () =>
  api.get('/categories').then(r => r.data)

export const getDistricts = () =>
  api.get('/districts').then(r => r.data)

export const getPublicSettings = () =>
  api.get('/settings/public').then(r => r.data)

export const createOrder = (data) =>
  api.post('/orders', data).then(r => r.data)

export default api
