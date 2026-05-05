
import api from './api'

export const authService = {
  async login(correo, contrasena) {
    try {
      console.log('Intentando login con:', correo)
      const response = await api.post('/login', { correo, contrasena })
      console.log('Respuesta login:', response.data)
      
      if (response.data.usuario) {
        localStorage.setItem('user', JSON.stringify(response.data.usuario))
        localStorage.setItem('token', btoa(correo + ':' + new Date().getTime()))
      }
      return response.data
    } catch (error) {
      console.error('Error en login:', error)
      throw error.response?.data || { message: 'Error de conexión' }
    }
  },

  logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user')
  }
}