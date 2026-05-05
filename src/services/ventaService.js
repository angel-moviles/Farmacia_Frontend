import api from './api'

export const ventaService = {
  async getAll() {
    try {
      const response = await api.get('/ventas')
      return response.data
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      throw error
    }
  },

  async create(data) {
    try {
      console.log('Enviando venta al servidor:', data)
      const response = await api.post('/ventas', data)
      console.log('Respuesta del servidor:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al crear venta:', error)
      if (error.response) {
        console.error('Respuesta del error:', error.response.data)
        throw new Error(error.response.data.message || 'Error al procesar la venta')
      }
      throw error
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/ventas/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al cargar venta:', error)
      throw error
    }
  },

  async getVentasDelDia() {
    try {
      const response = await api.get('/ventas/dia')
      return response.data
    } catch (error) {
      console.error('Error al cargar ventas del día:', error)
      throw error
    }
  }
}