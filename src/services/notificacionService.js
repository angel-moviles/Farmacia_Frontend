import api from './api'

export const notificacionService = {
  // Obtener notificaciones del usuario
  async getNotificaciones() {
    try {
      // Por ahora simulamos notificaciones, pero aquí iría la llamada real a la API
      // const response = await api.get('/notificaciones')
      // return response.data
      
      // Datos simulados
      return [
        {
          id: 1,
          titulo: 'Stock bajo',
          mensaje: 'Paracetamol 500mg está por debajo del stock mínimo',
          tiempo: 'hace 5 minutos',
          leida: false,
          tipo: 'warning',
          icono: '⚠️',
          accion: '/productos/1'
        },
        {
          id: 2,
          titulo: 'Producto próximo a caducar',
          mensaje: 'Ibuprofeno 400mg caduca en 15 días',
          tiempo: 'hace 1 hora',
          leida: false,
          tipo: 'danger',
          icono: '🔴',
          accion: '/productos/2'
        },
        {
          id: 3,
          titulo: 'Venta realizada',
          mensaje: 'Venta #1234 por $850.00',
          tiempo: 'hace 2 horas',
          leida: true,
          tipo: 'success',
          icono: '✅',
          accion: '/ventas/1234'
        },
        {
          id: 4,
          titulo: 'Nuevo usuario registrado',
          mensaje: 'María García se ha registrado como cajero',
          tiempo: 'hace 3 horas',
          leida: true,
          tipo: 'info',
          icono: '👤',
          accion: '/usuarios/5'
        },
        {
          id: 5,
          titulo: 'Proveedor actualizado',
          mensaje: 'Distribuidora Farmacéutica SA actualizó su catálogo',
          tiempo: 'hace 5 horas',
          leida: false,
          tipo: 'info',
          icono: '📦',
          accion: '/proveedores/1'
        }
      ]
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      return []
    }
  },

  // Marcar notificación como leída
  async marcarComoLeida(id) {
    try {
      // const response = await api.put(`/notificaciones/${id}/leer`)
      // return response.data
      return { success: true }
    } catch (error) {
      console.error('Error al marcar notificación:', error)
      throw error
    }
  },

  // Marcar todas como leídas
  async marcarTodasComoLeidas() {
    try {
      // const response = await api.put('/notificaciones/leer-todas')
      // return response.data
      return { success: true }
    } catch (error) {
      console.error('Error al marcar notificaciones:', error)
      throw error
    }
  },

  // Eliminar notificación
  async eliminarNotificacion(id) {
    try {
      // const response = await api.delete(`/notificaciones/${id}`)
      // return response.data
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      throw error
    }
  }
}