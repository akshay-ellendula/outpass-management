import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router"; // Fixed import
import {
  Shield,
  LayoutDashboard,
  UserCog,
  FileText,
  Settings,
  LogOut,
  GraduationCap,
  Menu, // Added Menu icon
  X     // Added Close icon
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  const handleLogout = async () => {
    await logout();
  };

  // Close menu when clicking a link on mobile
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";
  };

  // Helper for dynamic header titles
  const getHeaderTitle = () => {
    if (location.pathname.includes("dashboard")) return "System Overview";
    if (location.pathname.includes("wardens")) return "Warden Management";
    if (location.pathname.includes("guards")) return "Security Guard Management";
    if (location.pathname.includes("students")) return "Student Management";
    if (location.pathname.includes("reports")) return "System Reports";
    if (location.pathname.includes("settings")) return "Global Settings";
    return "Admin Panel";
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased h-screen flex overflow-hidden font-sans">
      
      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col h-full transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:shrink-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-wide">
              Admin Panel
            </span>
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-500 hover:text-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link
            to="/admin/dashboard"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/admin/dashboard")}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
            User Management
          </p>
          <Link
            to="/admin/wardens"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/admin/wardens")}`}
          >
            <UserCog className="w-5 h-5" />
            <span className="font-medium text-sm">Wardens</span>
          </Link>
          <Link
            to="/admin/guards"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/admin/guards")}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium text-sm">Security Guards</span>
          </Link>
          <Link
            to="/admin/students"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/admin/students")}`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium text-sm">Students</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
            Configuration
          </p>
          <Link
            to="/admin/settings"
            onClick={handleLinkClick}
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/admin/settings")}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Global Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 uppercase truncate">
                Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h2 className="text-lg font-bold text-slate-800 truncate">
              {getHeaderTitle()}
            </h2>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentDate}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;