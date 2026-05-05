import api from './api'

export const rolService = {
  async getAll() {
    try {
      const response = await api.get('/roles')
      return response.data
    } catch (error) {
      console.error('Error al cargar roles:', error)
      return []
    }
  },

  async getById(id) {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/roles', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/roles/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/roles/${id}`)
    return response.data
  }
}