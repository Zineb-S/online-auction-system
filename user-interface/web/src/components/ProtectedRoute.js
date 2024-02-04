import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

export const ProtectedRoute = ({ children, ...rest }) => {
  const isAuthenticated = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" />;
};
