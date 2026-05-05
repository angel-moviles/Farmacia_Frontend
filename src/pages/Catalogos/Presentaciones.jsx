import { useState, useEffect } from 'react'
import { presentacionService } from '../../services/presentacionService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi' // FiPackage ya existe
import toast from 'react-hot-toast'
import './Catalogos.css'

const Presentaciones = () => {
  const [presentaciones, setPresentaciones] = useState([])
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
      const filtered = presentaciones.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFiltered(filtered)
    } else {
      setFiltered(presentaciones)
    }
  }, [searchTerm, presentaciones])

  const loadData = async () => {
    try {
      const data = await presentacionService.getAll()
      setPresentaciones(data)
      setFiltered(data)
    } catch (error) {
      toast.error('Error al cargar presentaciones')
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
    if (window.confirm('¿Estás seguro de eliminar esta presentación?')) {
      try {
        await presentacionService.delete(id)
        toast.success('Presentación eliminada')
        loadData()
      } catch (error) {
        toast.error('Error al eliminar presentación')
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
        await presentacionService.update(selectedItem.id_presentacion, formData)
        toast.success('Presentación actualizada')
      } else {
        await presentacionService.create(formData)
        toast.success('Presentación creada')
      }
      setShowModal(false)
      setSelectedItem(null)
      setFormData({ nombre: '' })
      loadData()
    } catch (error) {
      toast.error('Error al guardar presentación')
    }
  }

  return (
    <div className="catalogo-page">
      <div className="page-header">
        <div className="header-title">
          <h2>
            <FiPackage className="title-icon" />
            Presentaciones
          </h2>
          <span className="header-count">{filtered.length} presentaciones</span>
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
          Nueva Presentación
        </Button>
      </div>

      <Card className="filters-card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar presentación..."
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
                <tr key={item.id_presentacion}>
                  <td>{item.id_presentacion}</td>
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
                      onClick={() => handleDelete(item.id_presentacion)}
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
          title={selectedItem ? 'Editar Presentación' : 'Nueva Presentación'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <Input
              label="Nombre de la Presentación"
              value={formData.nombre}
              onChange={(e) => setFormData({ nombre: e.target.value })}
              placeholder="Ej: Tabletas, Jarabe, Inyectable..."
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

export default Presentaciones