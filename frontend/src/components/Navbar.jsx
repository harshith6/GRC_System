import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            
            <Link to="/dashboard" className="flex items-center">
              <span className="text-3xl font-bold text-gray-900">
                GRC System
              </span>
            </Link>
            
            {/* Navigation links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive('/dashboard')
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                to="/checklists"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive('/checklists') || location.pathname.startsWith('/checklists/')
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Checklists
              </Link>
            </div>
          </div>
          
          {/* User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-medium text-gray-900">{user?.username}</span>
            </span>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation - shown on small screens */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              isActive('/dashboard')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </Link>
          
          <Link
            to="/checklists"
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              isActive('/checklists')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            Checklists
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
