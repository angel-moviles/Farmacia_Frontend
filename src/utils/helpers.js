// Función debounce para evitar muchas llamadas
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Formatear precio
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '$0.00'
  const numPrice = Number(price)
  if (isNaN(numPrice)) return '$0.00'
  return `$${numPrice.toFixed(2)}`
}

// Formatear fecha
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}