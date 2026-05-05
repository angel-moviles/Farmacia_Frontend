import { useState } from 'react'

export const useForm = (initialState = {}) => {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value
    })
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
  }

  const reset = () => {
    setValues(initialState)
    setErrors({})
  }

  const setValue = (name, value) => {
    setValues({
      ...values,
      [name]: value
    })
  }

  return {
    values,
    setValues,  // <-- EXPORTAR setValues
    errors,
    setErrors,
    handleChange,
    reset,
    setValue
  }
}