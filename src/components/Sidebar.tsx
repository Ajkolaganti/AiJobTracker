import React, { useState } from 'react';
import { Briefcase, User, Settings, BarChart, FileText, LogOut, Mic, ChevronDown, Phone, Video } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const mainMenuItems = [
    { name: 'Dashboard', icon: BarChart, path: '/dashboard' },
    { name: 'Job Applications', icon: Briefcase, path: '/applications' },
    { name: 'Generate Resume', icon: FileText, path: '/generate-resume' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const isActivePath = (path: string) => location.pathname.startsWith(path);

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
        {mainMenuItems.map((item) => {
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

        {/* Meeting Copilot Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 
              ${isActivePath('/copilot') ? 'bg-gray-700' : ''}`}>
              <Mic className="h-5 w-5" />
              <span className="ml-2">Interview Copilot</span>
              <ChevronDown className="ml-auto h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem 
              className="hover:bg-gray-700 focus:bg-gray-700"
              onClick={() => navigate('/copilot/phone')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Phone Call
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="hover:bg-gray-700 focus:bg-gray-700"
              onClick={() => navigate('/copilot/video')}
            >
              <Video className="mr-2 h-4 w-4" />
              Video Call
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

const logout = async () => {
  localStorage.removeItem('userToken');
};