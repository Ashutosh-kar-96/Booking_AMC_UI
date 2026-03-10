import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // If no token → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role not allowed → go to home
  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;