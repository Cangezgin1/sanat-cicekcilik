import axios from 'axios'

const api = axios.create({
  baseURL: 'https://sanat-cicekcilik-backend.onrender.com/api',
  timeout: 10000,
})

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
