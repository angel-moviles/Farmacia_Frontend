import { useState, useEffect } from 'react'
import { laboratorioService } from '../../services/laboratorioService'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiBox } from 'react-icons/fi' // Cambiado FiFlask por FiBox
import toast from 'react-hot-toast'
import './Catalogos.css'

const Laboratorios = () => {
  const [laboratorios, setLaboratorios] = useState([])
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
      const filtered = laboratorios.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFiltered(filtered)
    } else {
      setFiltered(laboratorios)
    }
  }, [searchTerm, laboratorios])

  const loadData = async () => {
    try {
      const data = await laboratorioService.getAll()
      setLaboratorios(data)
      setFiltered(data)
    } catch (error) {
      toast.error('Error al cargar laboratorios')
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
    if (window.confirm('¿Estás seguro de eliminar este laboratorio?')) {
      try {
        await laboratorioService.delete(id)
        toast.success('Laboratorio eliminado')
        loadData()
      } catch (error) {
        toast.error('Error al eliminar laboratorio')
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
        await laboratorioService.update(selectedItem.id_laboratorio, formData)
        toast.success('Laboratorio actualizado')
      } else {
        await laboratorioService.create(formData)
        toast.success('Laboratorio creado')
      }
      setShowModal(false)
      setSelectedItem(null)
      setFormData({ nombre: '' })
      loadData()
    } catch (error) {
      toast.error('Error al guardar laboratorio')
    }
  }

  return (
    <div className="catalogo-page">
      <div className="page-header">
        <div className="header-title">
          <h2>
            <FiBox className="title-icon" /> {/* Cambiado FiFlask por FiBox */}
            Laboratorios
          </h2>
          <span className="header-count">{filtered.length} laboratorios</span>
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
          Nuevo Laboratorio
        </Button>
      </div>

      <Card className="filters-card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar laboratorio..."
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
                <tr key={item.id_laboratorio}>
                  <td>{item.id_laboratorio}</td>
                  <td>{item.nombre}</td>
                  <td>{item.creado_en ? new Date(item.creado_en).toLocaleDateString() : '-'}</td>
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
                      onClick={() => handleDelete(item.id_laboratorio)}
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
          title={selectedItem ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}
        >
          <form onSubmit={handleSubmit} className="modal-form">
            <Input
              label="Nombre del Laboratorio"
              value={formData.nombre}
              onChange={(e) => setFormData({ nombre: e.target.value })}
              placeholder="Ej: Bayer, Pfizer, Roche..."
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

export default Laboratorios