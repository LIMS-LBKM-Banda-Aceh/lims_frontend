import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistrationEdit from "./pages/RegistrationEdit"; // Import komponen edit

// Komponen untuk melindungi route khusus user login
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Jika ada allowedRoles, cek role user
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Tambahkan route untuk edit registration */}
          <Route
            path="/registrations/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'input', 'lab']}>
                <RegistrationEdit />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Fallback untuk halaman tidak ditemukan */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Hanya SATU ToastContainer */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;