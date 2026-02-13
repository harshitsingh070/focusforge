import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/authSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="font-display text-xl font-bold text-gray-900">
          FocusForge
        </Link>
        <div className="flex items-center gap-3">
          <p className="max-w-[14rem] truncate text-sm font-semibold text-gray-700">
            {user?.username || user?.email || 'User'}
          </p>
          <button onClick={handleLogout} className="btn-secondary px-3 py-2">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
