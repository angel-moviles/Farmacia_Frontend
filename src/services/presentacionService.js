import api from './api'

export const presentacionService = {
  async getAll() {
    try {
      const response = await api.get('/presentaciones')
      return response.data
    } catch (error) {
      console.error('Error al cargar presentaciones:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/presentaciones/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al cargar presentación:', error)
      throw error
    }
  },

  async create(data) {
    try {
      const response = await api.post('/presentaciones', data)
      return response.data
    } catch (error) {
      console.error('Error al crear presentación:', error)
      throw error
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/presentaciones/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error al actualizar presentación:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/presentaciones/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar presentación:', error)
      throw error
    }
  }
}