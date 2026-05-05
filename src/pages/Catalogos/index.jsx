import { Routes, Route, Navigate } from 'react-router-dom'
import Laboratorios from './Laboratorios'
import TiposProducto from './TiposProducto'
import Presentaciones from './Presentaciones'
import './Catalogos.css'

const Catalogos = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalogos/laboratorios" />} />
      <Route path="laboratorios" element={<Laboratorios />} />
      <Route path="tipos" element={<TiposProducto />} />
      <Route path="presentaciones" element={<Presentaciones />} />
    </Routes>
  )
}

export default Catalogos