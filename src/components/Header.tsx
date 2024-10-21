import React from 'react';
import { Briefcase, User, Settings, BarChart, FileText, FileBarChart } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Briefcase className="text-blue-400" size={32} />
            <Link to="/dashboard">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                AI Job Tracker
              </span>
            </Link>
          </div>
          <nav>
            <ul className="flex items-center space-x-4">
              <li>
                <Link to="/">
                  <Button variant="ghost" className="text-white hover:text-blue-400">
                    <FileBarChart className="mr-2 h-5 w-5" />
                    Job Applications
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-white hover:text-blue-400">
                    <BarChart className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/generate-resume">
                  <Button variant="ghost" className="text-white hover:text-blue-400">
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Resume
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/profile">
                  <Button variant="ghost" className="text-white hover:text-blue-400">
                    <User className="mr-2 h-5 w-5" />
                    Profile
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <Button variant="ghost" className="text-white hover:text-blue-400">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}