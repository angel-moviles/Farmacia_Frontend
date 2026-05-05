import api from './api'

export const dashboardService = {
  async getStats() {
    try {
      const response = await api.get('/dashboard')
      return response.data
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
      return {
        success: false,
        stats: {
          total_usuarios: 0,
          usuarios_activos: 0,
          total_productos: 0,
          productos_activos: 0,
          total_ventas: 0,
          total_ingresos: 0,
          ventas_hoy: 0,
          ingresos_hoy: 0,
          ventas_semana: 0,
          ingresos_semana: 0,
          ventas_mes: 0,
          ingresos_mes: 0,
          ticket_promedio: 0
        }
      }
    }
  }
}