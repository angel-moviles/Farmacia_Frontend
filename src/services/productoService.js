import api from './api'

export const productoService = {
  getAll: async () => {
    try {
      const response = await api.get('/productos')
      return response.data.map(producto => ({
        ...producto,
        precio_venta: Number(producto.precio_venta) || 0,
        costo: Number(producto.costo) || 0,
        stock: Number(producto.stock) || 0,
        stock_minimo: Number(producto.stock_minimo) || 0,
        foto_url: producto.foto_url || null  // Asegurar que foto_url está presente
      }))
    } catch (error) {
      console.error('Error al cargar productos:', error)
      throw error
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al cargar producto:', error)
      throw error
    }
  },

  create: async (data) => {
    try {
      const formData = new FormData()
      
      Object.keys(data).forEach(key => {
        if (key === 'foto' && data[key] instanceof File) {
          formData.append('foto', data[key])
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key])
        }
      })

      const response = await api.post('/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al crear producto:', error)
      throw error
    }
  },

  update: async (id, data) => {
    try {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      
      Object.keys(data).forEach(key => {
        if (key === 'foto' && data[key] instanceof File) {
          formData.append('foto', data[key])
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key])
        }
      })

      const response = await api.post(`/productos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      throw error
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/productos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      throw error
    }
  },

  buscarPorCodigoBarras: async (codigo) => {
    try {
      const response = await api.get(`/productos/buscar/codigo/${codigo}`)
      const producto = response.data
      return {
        ...producto,
        precio_venta: Number(producto.precio_venta) || 0,
        costo: Number(producto.costo) || 0,
        stock: Number(producto.stock) || 0,
        stock_minimo: Number(producto.stock_minimo) || 0,
        foto_url: producto.foto_url || null
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null
      }
      console.error('Error al buscar por código de barras:', error)
      throw error
    }
  }
}