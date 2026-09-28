import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/auth';

const Topbar = ({ backTo, title, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {}
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex items-center justify-between px-8 py-5">
      {title ? (
        <button onClick={() => navigate(backTo || '/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
      ) : onSearch ? (
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 text-sm w-72 focus-within:ring-2 focus-within:ring-orange-100">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search documents..."
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm text-gray-700 font-medium">{user?.name || 'User'}</span>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600" title="Logout">
          <LogOut size={17} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;