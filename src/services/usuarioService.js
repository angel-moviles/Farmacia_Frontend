import api from './api'

export const usuarioService = {
  async getAll() {
    const response = await api.get('/usuarios')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  async create(data) {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      // Si es la foto y es un archivo, lo agregamos
      if (key === 'foto' && data[key] instanceof File) {
        formData.append('foto', data[key])
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    })

    const response = await api.post('/usuarios', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async update(id, data) {
    const formData = new FormData()
    // Spoofing de método: Enviamos POST pero Laravel lo procesa como PUT
    formData.append('_method', 'PUT')
    
    Object.keys(data).forEach(key => {
      if (key === 'foto') {
        if (data[key] instanceof File) {
          formData.append('foto', data[key])
        }
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    })

    const response = await api.post(`/usuarios/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  }
}