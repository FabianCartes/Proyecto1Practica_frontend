import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Asegúrate de tener instalado React Router
import api from '../api.js'; // Configuración de Axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });

      const { token, user } = response.data;

      // Guardar en LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // Comparar el rol y redirigir
      if (user.role && user.role.trim() === 'moderador') {
        navigate('/homeMod');
      } else if (user.role && user.role.trim() === 'user') {
        navigate('/home');
      } else {
        console.error('Rol desconocido:', user.role);
        navigate('/login'); // Fallback en caso de rol inválido
      }

      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await api.post('/auth/register', { email, username, password });
      return response.status === 201;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Redirige al inicio o página de login
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
