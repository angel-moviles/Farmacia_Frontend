import { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = () => {
    const storedUser = authService.getCurrentUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }

  const login = async (correo, contrasena) => {
    const response = await authService.login(correo, contrasena)
    if (response.usuario) {
      setUser(response.usuario)
    }
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // ESTA ES LA FUNCIÓN CLAVE CORREGIDA
  const updateUser = (updatedUserData) => {
    // 1. Obtenemos lo que ya tenemos para no perder otros datos
    const currentUser = JSON.parse(localStorage.getItem('user')) || {}
    
    // 2. Mezclamos con lo que viene del servidor (que trae la nueva foto_url)
    const newUser = { ...currentUser, ...updatedUserData }
    
    // 3. Guardamos en LocalStorage para que al dar F5 no se borre
    localStorage.setItem('user', JSON.stringify(newUser))
    
    // 4. Actualizamos el estado con una COPIA nueva para forzar el re-render
    setUser({ ...newUser })
    
    console.log('Sincronización de usuario completada:', newUser.foto_url)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}