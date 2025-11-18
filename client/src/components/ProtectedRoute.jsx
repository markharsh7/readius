// client/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // We show a loading state to prevent a flicker
  // while the context is checking for the token on initial load.
  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the landing page
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child component
  return children;
};

export default ProtectedRoute;