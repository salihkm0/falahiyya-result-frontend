import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  Calendar,
  FileText,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  UserCog
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/teachers', icon: UserCog, label: 'Teachers' },
    { path: '/classes', icon: GraduationCap, label: 'Classes' },
    { path: '/subjects', icon: BookOpen, label: 'Subjects' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/exams', icon: FileText, label: 'Exams' },
    { path: '/announcements', icon: Bell, label: 'Announcements' },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <span className="text-xl font-bold text-gray-800">Falahiyya</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
                    isActive && "bg-blue-50 text-blue-600 border-r-4 border-blue-600",
                    collapsed && "justify-center"
                  )
                }
              >
                <item.icon size={20} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;