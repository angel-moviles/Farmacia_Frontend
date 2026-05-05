import { useState, useEffect } from 'react'
import { proveedorService } from '../../services/proveedorService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import ProveedorForm from './ProveedorForm'
import './Proveedores.css'

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const data = await proveedorService.getAll()
      setProveedores(data)
    } catch (error) {
      toast.error(error?.message || 'Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await proveedorService.delete(id)
        toast.success('Proveedor eliminado')
        loadProveedores()
      } catch (error) {
        toast.error(error?.message || 'Error al eliminar proveedor')
      }
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedProveedor(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadProveedores()
  }

  const filteredProveedores = proveedores.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Contacto', accessor: 'nombre_contacto' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Dirección', accessor: 'direccion' },
    { 
      header: 'Fecha Ingreso', 
      accessor: 'fecha_ingreso',
      render: (row) => new Date(row.fecha_ingreso).toLocaleDateString()
    },
    { 
      header: 'Estado', 
      accessor: 'activo',
      render: (row) => (
        <span className={`status-badge ${row.activo ? 'active' : 'inactive'}`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="action-buttons">
          <Button
            variant="outline"
            size="small"
            onClick={() => handleEdit(row)}
            icon={<FiEdit2 />}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDelete(row.id_proveedor)}
            icon={<FiTrash2 />}
          >
            Eliminar
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="proveedores-page">
      <div className="page-header">
        <h2>Proveedores</h2>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          icon={<FiPlus />}
        >
          Nuevo Proveedor
        </Button>
      </div>

      <Card className="search-card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="loading">Cargando proveedores...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredProveedores}
          />
        )}
      </Card>

      {showForm && (
        <ProveedorForm
          proveedor={selectedProveedor}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default Proveedores