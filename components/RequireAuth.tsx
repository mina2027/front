import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
}
