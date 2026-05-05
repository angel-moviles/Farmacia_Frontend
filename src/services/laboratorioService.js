import api from './api'

export const laboratorioService = {
  async getAll() {
    try {
      const response = await api.get('/laboratorios')
      return response.data
    } catch (error) {
      console.error('Error al cargar laboratorios:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/laboratorios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al cargar laboratorio:', error)
      throw error
    }
  },

  async create(data) {
    try {
      const response = await api.post('/laboratorios', data)
      return response.data
    } catch (error) {
      console.error('Error al crear laboratorio:', error)
      throw error
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/laboratorios/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error al actualizar laboratorio:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/laboratorios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar laboratorio:', error)
      throw error
    }
  }
}