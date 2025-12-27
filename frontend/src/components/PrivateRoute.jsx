import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';

export const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};
