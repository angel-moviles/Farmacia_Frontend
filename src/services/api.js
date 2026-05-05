import axios from 'axios'

// Prioridad: 1. Variable de entorno VITE, 2. Localhost 8000 (XAMPP/PHP Artisan)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

console.log('API URL Actual:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 
})

// Interceptor para agregar token (Mantenemos tu lógica de localStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log para debug en consola del navegador
    console.log('Enviando a:', config.method.toUpperCase(), config.url)
    
    // Manejo de FormData (para cuando subas la foto del producto)
    if (config.data instanceof FormData) {
      console.log('Enviando archivos (FormData)...')
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expiró en local, limpiamos y mandamos a login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api