import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Si el usuario no está autenticado, redirige a /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Si el rol del usuario no está permitido, redirige a una página de acceso denegado o al home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  // Si todo está correcto, renderiza el contenido protegido
  return children;
}

export default PrivateRoute;
