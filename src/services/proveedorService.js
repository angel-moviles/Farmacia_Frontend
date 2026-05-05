import api from './api'

export const proveedorService = {
  async getAll() {
    try {
      const response = await api.get('/proveedores')
      return response.data
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/proveedores/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al cargar proveedor:', error)
      throw error
    }
  },

  async create(data) {
    try {
      const response = await api.post('/proveedores', data)
      return response.data
    } catch (error) {
      console.error('Error al crear proveedor:', error)
      throw error
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/proveedores/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error al actualizar proveedor:', error)
      throw error
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/proveedores/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar proveedor:', error)
      throw error
    }
  }
}