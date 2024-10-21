import React from 'react';
import { Briefcase, User, Settings, BarChart, FileText, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: BarChart, path: '/dashboard' },
    { name: 'Job Applications', icon: Briefcase, path: '/applications' },
    { name: 'Generate Resume', icon: FileText, path: '/generate-resume' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    // Simulate logout function (you should implement your actual logout logic)
    await logout();
    navigate('/signin');
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 md:static md:inset-0 z-50 transition-transform duration-300 bg-gray-800 text-white 
      w-64 flex flex-col`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Briefcase className="text-blue-400" size={32} />
          <span className="ml-2 text-xl font-bold">AI Job Tracker</span>
        </div>
        {/* Close button only visible on smaller screens */}
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <nav className="mt-4 flex-grow">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-2 hover:bg-gray-700 
              ${isActive ? 'bg-gray-700' : ''}`}
            >
              <Icon className="h-5 w-5" />
              <span className="ml-2">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 bg-gray-800-to-gray-900 text-white">
        <Button
          variant="outline"
          className="w-full h-15 flex bg-gradient-to-r from-gray-800-from-gray-900 to-gray-800-to-gray-900 bg-gray-800-to-gray-900 text-blue items-center justify-center hover:bg-gray-700"
          onClick={handleLogout}
        >
          <LogOut className="h-10 w-20 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

// Logout function - Simulate user logout (customize based on your auth logic)
const logout = async () => {
  localStorage.removeItem('userToken');
};