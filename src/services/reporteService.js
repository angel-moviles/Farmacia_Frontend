import api from './api'

export const reporteService = {
  // Obtener datos de ventas por período
  async getVentasPorPeriodo(fechaInicio, fechaFin) {
    try {
      console.log('Solicitando reporte de ventas:', { fechaInicio, fechaFin })
      const response = await api.get('/reportes/ventas', {
        params: { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener reporte de ventas:', error)
      throw error
    }
  },

  // Obtener reporte de inventario
  async getInventario(filtros = {}) {
    try {
      const response = await api.get('/reportes/inventario', { params: filtros })
      return response.data
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error)
      throw error
    }
  },

  // Obtener productos más vendidos
  async getProductosMasVendidos(fechaInicio, fechaFin, limite = 10) {
    try {
      const response = await api.get('/reportes/productos-mas-vendidos', {
        params: { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin, 
          limite 
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error)
      throw error
    }
  },

  // Obtener movimientos de inventario
  async getMovimientosInventario(fechaInicio, fechaFin, tipo = 'todos') {
    try {
      const response = await api.get('/reportes/movimientos', {
        params: { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin, 
          tipo 
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener movimientos:', error)
      throw error
    }
  },

  // Obtener ventas por usuario
  async getVentasPorUsuario(fechaInicio, fechaFin) {
    try {
      const response = await api.get('/reportes/ventas-por-usuario', {
        params: { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener ventas por usuario:', error)
      throw error
    }
  },

  // Exportar a PDF
  async exportarPDF(tipo, fechaInicio, fechaFin) {
    try {
      let url = ''
      let params = {}
      
      if (tipo === 'ventas') {
        url = '/reportes/ventas/pdf'
        params = { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      } else if (tipo === 'inventario') {
        url = '/reportes/inventario/pdf'
      } else if (tipo === 'productos') {
        url = '/reportes/productos/pdf'
        params = { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      }

      const response = await api.post(url, params, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      throw error
    }
  },

  // Exportar a Excel
  async exportarExcel(tipo, fechaInicio, fechaFin) {
    try {
      let url = ''
      let params = {}
      
      if (tipo === 'ventas') {
        url = '/reportes/ventas/excel'
        params = { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      } else if (tipo === 'inventario') {
        url = '/reportes/inventario/excel'
      } else if (tipo === 'productos') {
        url = '/reportes/productos/excel'
        params = { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      }

      const response = await api.post(url, params, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      throw error
    }
  },

  // Exportar a CSV
  async exportarCSV(tipo, fechaInicio, fechaFin) {
    try {
      let url = ''
      let params = {}
      
      if (tipo === 'ventas') {
        url = '/reportes/ventas/csv'
        params = { 
          fecha_inicio: fechaInicio, 
          fecha_fin: fechaFin 
        }
      } else if (tipo === 'inventario') {
        url = '/reportes/inventario/csv'
      }

      const response = await api.post(url, params, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error al exportar CSV:', error)
      throw error
    }
  }
}