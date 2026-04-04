import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import StreamerDashboard from './pages/streamer/StreamerDashboard';
import TikTokConnection from './pages/streamer/TikTokConnection';
import UserShop from './pages/user/UserShop';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes - Streamer */}
          <Route
            path="/streamer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['streamer', 'admin']}>
                <StreamerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/streamer/tiktok"
            element={
              <ProtectedRoute allowedRoles={['streamer']}>
                <TikTokConnection />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes - User */}
          <Route
            path="/user/shop"
            element={
              <ProtectedRoute allowedRoles={['user', 'streamer', 'admin']}>
                <UserShop />
              </ProtectedRoute>
            }
          />
          
          {/* Unauthorized Page */}
          <Route
            path="/unauthorized"
            element={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h1>🚫 Unauthorized</h1>
                <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <a href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                  กลับไปหน้า Login
                </a>
              </div>
            }
          />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
