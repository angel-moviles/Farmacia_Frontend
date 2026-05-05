import { useState, useEffect } from 'react'
import { tipoProductoService } from '../../services/tipoProductoService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiTag } from 'react-icons/fi' // FiTag ya existe
import toast from 'react-hot-toast'
import './Catalogos.css'

const TiposProducto = () => {
  const [tipos, setTipos] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ nombre: '' })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = tipos.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFiltered(filtered)
    } else {
      setFiltered(tipos)
    }
  }, [searchTerm, tipos])

  const loadData = async () => {
    try {
      const data = await tipoProductoService.getAll()
      setTipos(data)
      setFiltered(data)
    } catch (error) {
      toast.error('Error al cargar tipos de producto')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData({ nombre: item.nombre })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este tipo?')) {
      try {
        await tipoProductoService.delete(id)
        toast.success('Tipo eliminado')
        loadData()
      } catch (error) {
        toast.error('Error al eliminar tipo')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    try {
      if (selectedItem) {
        await tipoProductoService.update(selectedItem.id_tipo_producto, formData)
        toast.success('Tipo actualizado')
      } else {
        await tipoProductoService.create(formData)
        toast.success('Tipo creado')
      }
      setShowModal(false)
      setSelectedItem(null)
      setFormData({ nombre: '' })
      loadData()
    } catch (error) {
      toast.error('Error al guardar tipo')
    }
  }

  return (
    <div className="catalogo-page">
      <div className="page-header">
        <div className="header-title">
          <h2>
            <FiTag className="title-icon" />
            Tipos de Producto
          </h2>
          <span className="header-count">{filtered.length} tipos</span>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedItem(null)
            setFormData({ nombre: '' })
            setShowModal(true)
          }}
          icon={<FiPlus />}
        >
          Nuevo Tipo
        </Button>
      </div>

      <Card className="filters-card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar tipo de producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="loading-container">Cargando...</div>
        ) : (
          <table className="catalogo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id_tipo_producto}>
                  <td>{item.id_tipo_producto}</td>
                  <td>{item.nombre}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                  <td className="action-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(item)}
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(item.id_tipo_producto)}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
            setFormData({ nombre: '' })
          }}
          title={selectedItem ? 'Editar Tipo' : 'Nuevo Tipo'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <Input
              label="Nombre del Tipo"
              value={formData.nombre}
              onChange={(e) => setFormData({ nombre: e.target.value })}
              placeholder="Ej: Analgésico, Antibiótico..."
              autoFocus
              required
            />
            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {selectedItem ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default TiposProducto