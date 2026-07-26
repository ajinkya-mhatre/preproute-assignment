import { Navigate } from 'react-router-dom';
import React from "react";
import {useAuthStore} from "../../store/authStore.ts";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
