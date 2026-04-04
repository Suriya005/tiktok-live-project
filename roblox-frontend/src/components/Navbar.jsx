import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/authService';
import './Dashboard.css';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logoutUser();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>🎮 Roblox Event System</h2>
      </div>
      <div className="nav-user">
        <span className="user-email">{user?.email}</span>
        <span className="user-role">{user?.role}</span>
        <button onClick={handleLogout} className="btn-logout">ออกจากระบบ</button>
      </div>
    </nav>
  );
};

export default Navbar;
