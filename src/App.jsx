import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import SubtaskDetail from './pages/SubtaskDetail';
import ProspectDetail from './pages/ProspectDetail';
import RoleManagement from './pages/RoleManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading, user } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Initializing...</div>;
  if (!token) return <Navigate to="/login" />;

  // Support both normal children and render props (functions)
  if (typeof children === 'function') {
    return children({ user });
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={2000} />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route
              index
              element={
                <ProtectedRoute>
                  {({ user }) => {
                    if (user?.role === 'Admin') return <Navigate to="/projects" />;
                    return <Navigate to="/dashboard" />;
                  }}
                </ProtectedRoute>
              }
            />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="prospects" element={<Prospects />} />
            <Route path="prospects/:id" element={<ProspectDetail />} />
            <Route path="projects" element={<Projects doneOnly={false} />} />
            <Route path="project-status" element={<Projects doneOnly={true} />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="projects/:projectId/subtasks/:subtaskId" element={<SubtaskDetail />} />
            <Route path="admin" element={<RoleManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
