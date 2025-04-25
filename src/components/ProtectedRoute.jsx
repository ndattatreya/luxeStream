import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authContext';

const ProtectedRoute = ({ children, isAdminRoute = false, isUserRoute = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={isAdminRoute ? '/adminlogin' : '/userlogin'} />;
  }

  if (isAdminRoute && user.role !== 'admin') {
    return <Navigate to="/adminlogin" />;
  }

  if (isUserRoute && user.role !== 'user') {
    return <Navigate to="/userlogin" />;
  }

  return children;
};

export default ProtectedRoute;
