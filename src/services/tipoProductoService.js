import api from './api'

export const tipoProductoService = {
  async getAll() {
    try {
      const response = await api.get('/tipoproductos')
      return response.data
    } catch (error) {
      console.error('Error al cargar tipos de producto:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/tipoproductos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al cargar tipo de producto:', error)
      throw error
    }
  },

  async create(data) {
    try {
      const response = await api.post('/tipoproductos', data)
      return response.data
    } catch (error) {
      console.error('Error al crear tipo de producto:', error)
      throw error
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/tipoproductos/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error al actualizar tipo de producto:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/tipoproductos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar tipo de producto:', error)
      throw error
    }
  }
}