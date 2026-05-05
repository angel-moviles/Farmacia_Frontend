import { useState, useEffect, useCallback } from 'react'
import { productoService } from '../../services/productoService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiGrid, // Cambiado de FiBarcode a FiGrid
  FiFilter,
  FiDownload,
  FiPrinter,
  FiPackage,
  FiAlertCircle
} from 'react-icons/fi'
import { debounce } from '../../utils/helpers'
import toast from 'react-hot-toast'
import ProductoForm from './ProductoForm'
import './Productos.css'

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [filteredProductos, setFilteredProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStock, setFiltroStock] = useState('todos') // 'todos', 'bajo-stock', 'sin-stock'
  const [stats, setStats] = useState({
    total: 0,
    conStock: 0,
    sinStock: 0,
    stockBajo: 0
  })


  useEffect(() => {
    loadProductos()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [productos, searchTerm, filtroStock])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const data = await productoService.getAll()
      console.log('Productos cargados:', data)
      setProductos(data)
      

      const stats = {
        total: data.length,
        conStock: data.filter(p => p.stock > 0).length,
        sinStock: data.filter(p => p.stock <= 0).length,
        stockBajo: data.filter(p => p.stock <= p.stock_minimo && p.stock > 0).length
      }
      setStats(stats)
      
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = useCallback(() => {
    let filtrados = [...productos]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtrados = filtrados.filter(p => 
        p.nombre?.toLowerCase().includes(term) ||
        p.lote?.toLowerCase().includes(term) ||
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(term)) ||
        p.id_producto?.toString().includes(term)
      )
    }

    switch(filtroStock) {
      case 'bajo-stock':
        filtrados = filtrados.filter(p => p.stock <= p.stock_minimo && p.stock > 0)
        break
      case 'sin-stock':
        filtrados = filtrados.filter(p => p.stock <= 0)
        break
      default:
        break
    }

    setFilteredProductos(filtrados)
  }, [productos, searchTerm, filtroStock])

  const handleEdit = (producto) => {
    setSelectedProducto(producto)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productoService.delete(id)
        toast.success('Producto eliminado')
        loadProductos()
      } catch (error) {
        toast.error('Error al eliminar producto')
      }
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedProducto(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadProductos()
  }

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '$0.00'
    const numPrice = Number(price)
    if (isNaN(numPrice)) return '$0.00'
    return `$${numPrice.toFixed(2)}`
  }

  const getStockStatus = (stock, stockMinimo) => {
    if (stock <= 0) {
      return { class: 'stock-sin', text: 'Sin stock', icon: '🔴' }
    }
    if (stock <= stockMinimo) {
      return { class: 'stock-bajo', text: 'Stock bajo', icon: '🟠' }
    }
    return { class: 'stock-normal', text: 'Normal', icon: '🟢' }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Código Barras', 'Lote', 'Nombre', 'Costo', 'Precio', 'Stock', 'Stock Mínimo', 'Estado']
    const csvData = filteredProductos.map(p => [
      p.id_producto,
      p.codigo_barras || '',
      p.lote,
      p.nombre,
      formatPrice(p.costo),
      formatPrice(p.precio_venta),
      p.stock,
      p.stock_minimo,
      p.activo ? 'Activo' : 'Inactivo'
    ])
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Productos exportados')
  }

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id_producto',
      width: '70px'
    },
      { 
        header: 'Foto', 
        accessor: 'foto_url',
        render: (row) => (
          <div className="producto-foto-mini">
            {row.foto_url ? (
              <img src={row.foto_url} alt={row.nombre} />
            ) : (
              <div className="sin-foto">📷</div>
            )}
          </div>
        )
      },
    { 
      header: 'Código Barras', 
      accessor: 'codigo_barras',
      render: (row) => (
        <div className="codigo-cell">
          {row.codigo_barras ? (
            <>
              <FiGrid className="codigo-icon" />
              <span className="codigo-text">{row.codigo_barras}</span>
            </>
          ) : (
            <span className="codigo-empty">—</span>
          )}
        </div>
      )
    },
    { 
      header: 'Lote', 
      accessor: 'lote',
      render: (row) => <span className="lote-badge">{row.lote || '—'}</span>
    },
    { 
      header: 'Nombre', 
      accessor: 'nombre',
      render: (row) => (
        <div className="nombre-cell">
          <span className="nombre-text">{row.nombre}</span>
          {!row.activo && <span className="inactivo-badge">Inactivo</span>}
        </div>
      )
    },
    { 
      header: 'Precio Venta', 
      accessor: 'precio_venta',
      render: (row) => <span className="precio-cell">{formatPrice(row.precio_venta)}</span>
    },
    { 
      header: 'Stock', 
      accessor: 'stock',
      render: (row) => {
        const status = getStockStatus(row.stock, row.stock_minimo)
        return (
          <div className={`stock-cell ${status.class}`}>
            <span className="stock-indicator">{status.icon}</span>
            <span className="stock-value">{row.stock}</span>
            {row.stock_minimo > 0 && (
              <span className="stock-minimo">/ mín: {row.stock_minimo}</span>
            )}
          </div>
        )
      }
    },
    {
      header: 'Acciones',
      width: '100px',
      render: (row) => (
        <div className="action-buttons">
          <button
            className="action-btn edit-btn"
            onClick={() => handleEdit(row)}
            title="Editar producto"
          >
            <FiEdit2 />
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => handleDelete(row.id_producto)}
            title="Eliminar producto"
          >
            <FiTrash2 />
          </button>
        </div>
      )
    }
    
  ]

  return (
    <div className="productos-page">
      {/* Header con título y acciones */}
      <div className="page-header">
        <div className="header-title">
          <h2>
            <FiPackage className="title-icon" />
            Productos
          </h2>
          <span className="header-count">{filteredProductos.length} productos</span>
        </div>
        <div className="header-actions">
          <Button
            variant="outline"
            size="medium"
            onClick={exportToCSV}
            icon={<FiDownload />}
          >
            Exportar
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={() => setShowForm(true)}
            icon={<FiPlus />}
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiPackage />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Productos</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon normal">
            <FiPackage />
          </div>
          <div className="stat-info">
            <span className="stat-label">Con Stock</span>
            <span className="stat-value">{stats.conStock}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bajo">
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <span className="stat-label">Stock Bajo</span>
            <span className="stat-value">{stats.stockBajo}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sin">
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <span className="stat-label">Sin Stock</span>
            <span className="stat-value">{stats.sinStock}</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="filters-card">
        <div className="filters-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, lote o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filtroStock === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroStock('todos')}
            >
              <FiFilter /> Todos
            </button>
            <button
              className={`filter-btn ${filtroStock === 'bajo-stock' ? 'active' : ''}`}
              onClick={() => setFiltroStock('bajo-stock')}
            >
              <FiAlertCircle /> Stock Bajo
            </button>
            <button
              className={`filter-btn ${filtroStock === 'sin-stock' ? 'active' : ''}`}
              onClick={() => setFiltroStock('sin-stock')}
            >
              <FiAlertCircle /> Sin Stock
            </button>
          </div>
        </div>
      </Card>

      {/* Tabla de productos */}
      <Card className="table-card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="empty-state">
            <FiPackage className="empty-icon" />
            <h3>No hay productos</h3>
            <p>
              {searchTerm || filtroStock !== 'todos' 
                ? 'No se encontraron productos con los filtros actuales'
                : 'Comienza agregando tu primer producto'}
            </p>
            {(searchTerm || filtroStock !== 'todos') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFiltroStock('todos')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredProductos}
          />
        )}
      </Card>

      {/* Modal para crear/editar producto */}
      {showForm && (
        <ProductoForm
          producto={selectedProducto}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default Productos