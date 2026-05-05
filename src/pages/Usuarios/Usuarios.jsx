import { useState, useEffect } from 'react'
import { usuarioService } from '../../services/usuarioService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import UsuarioForm from './UsuarioForm'
import './Usuarios.css'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const data = await usuarioService.getAll()
      setUsuarios(data)
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await usuarioService.delete(id)
        toast.success('Usuario eliminado')
        loadUsuarios()
      } catch (error) {
        toast.error('Error al eliminar usuario')
      }
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedUsuario(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadUsuarios()
  }

  const getRoleColor = (rol) => {
    switch(rol?.nombre?.toLowerCase()) {
      case 'admin':
        return '#1bbd71'
      case 'farmaceutico':
        return '#27AE60'
      case 'cajero':
        return '#E67E22'
      default:
        return '#3498DB'
    }
  }

  const filteredUsuarios = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.a_paterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.clave_usuario?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { header: 'Clave', accessor: 'clave_usuario' },
    { 
      header: 'Nombre', 
      accessor: 'nombre',
      render: (row) => `${row.nombre} ${row.a_paterno} ${row.a_materno || ''}`
    },
    { header: 'Correo', accessor: 'correo' },
    { header: 'Teléfono', accessor: 'telefono' },
    { 
      header: 'Rol', 
      accessor: 'rol',
      render: (row) => (
        <span 
          className="rol-badge"
          style={{ 
            backgroundColor: `${getRoleColor(row.rol)}20`,
            color: getRoleColor(row.rol)
          }}
        >
          {row.rol?.nombre}
        </span>
      )
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
            onClick={() => handleDelete(row.id_usuario)}
            icon={<FiTrash2 />}
          >
            Eliminar
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h2>Usuarios</h2>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          icon={<FiPlus />}
        >
          Nuevo Usuario
        </Button>
      </div>

      <Card className="search-card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="loading">Cargando usuarios...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredUsuarios}
          />
        )}
      </Card>

      {showForm && (
        <UsuarioForm
          usuario={selectedUsuario}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default Usuarios