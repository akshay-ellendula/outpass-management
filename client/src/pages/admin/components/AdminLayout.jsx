import React from "react";
import { Link, Outlet, useLocation } from "react-router"; // Use 'react-router-dom' if v6
import {
  Shield,
  LayoutDashboard,
  UserCog,
  FileText,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Helper to check active link for styling
  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased h-screen flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-wide">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link
            to="/admin/dashboard"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive(
              "/admin/dashboard"
            )}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
            User Management
          </p>
          <Link
            to="/admin/wardens"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive(
              "/admin/wardens"
            )}`}
          >
            <UserCog className="w-5 h-5" />
            <span className="font-medium text-sm">Wardens</span>
          </Link>
          <Link
            to="/admin/guards"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive(
              "/admin/guards"
            )}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium text-sm">Security Guards</span>
          </Link>
          <Link
            to="/admin/students"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive(
              "/admin/students"
            )}`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium text-sm">Students</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
            Configuration
          </p>
          <Link
            to="/admin/reports"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive(
              "/admin/reports"
            )}`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium text-sm">Reports</span>
          </Link>
          <Link
            to="/admin/settings"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive(
              "/admin/settings"
            )}`}
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
            <div>
              <p className="text-sm font-bold text-slate-800">Administrator</p>
              <p className="text-[10px] text-slate-500 uppercase">
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Common Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {/* Logic to change title based on path, or pass it as prop/context if needed. 
                For simplicity, we can just check the path or use a mapping. */}
            {location.pathname.includes("dashboard")
              ? "System Overview"
              : location.pathname.includes("wardens")
              ? "Warden Management"
              : location.pathname.includes("guards")
              ? "Security Guard Management"
              : location.pathname.includes("students")
              ? "Student Management"
              : "Admin Panel"}
          </h2>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentDate}
            </p>
          </div>
        </header>

        {/* Dynamic Page Content Renders Here */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;