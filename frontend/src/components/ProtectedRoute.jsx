import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { accessToken, checkingSession } = useAuth();
  if (checkingSession) return null; 
  if (!accessToken) return <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;