import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from '../types';

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              EduBit
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600">
                  Feed
                </Link>
                <Link to="/playlists" className="text-gray-700 hover:text-blue-600">
                  Playlists
                </Link>
                <Link to="/courses" className="text-gray-700 hover:text-blue-600">
                  Courses
                </Link>
                {user.role === 'creator' && (
                  <>
                    <Link to="/create-reel" className="text-gray-700 hover:text-blue-600">
                      Create Reel
                    </Link>
                    <Link to="/create-course" className="text-gray-700 hover:text-blue-600">
                      Create Course
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user.full_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
