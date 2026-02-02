import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROLES } from "../utils/constants";
import AdminDashboard from "./dashboard/AdminDashboard";
import AgentDashboard from "./dashboard/AgentDashboard";
import StudentDashboard from "./dashboard/StudentDashboard";

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.AGENT:
      return <AgentDashboard />;
    case ROLES.STUDENT:
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Dashboard;
