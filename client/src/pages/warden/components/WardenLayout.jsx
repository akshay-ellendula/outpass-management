import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import {
  ShieldCheck,
  LayoutDashboard,
  FileCheck,
  FileEdit,
  GraduationCap,
  Shield,
  AlertOctagon,
  LogOut,
  User, // Added User icon for Profile
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const WardenLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => {
    return location.pathname.includes(path)
      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Helper to determine Header Title
  const getHeaderTitle = () => {
    if (location.pathname.includes("dashboard")) return "Dashboard Overview";
    if (location.pathname.includes("approvals")) return "Pass Requests";
    if (location.pathname.includes("requests")) return "Edit Requests";
    if (location.pathname.includes("students")) return "Student Database";
    if (location.pathname.includes("security")) return "Security Management";
    if (location.pathname.includes("defaulters")) return "Defaulter List";
    if (location.pathname.includes("profile")) return "My Profile"; // Added Title
    return "Warden Panel";
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased h-screen flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">Warden Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link
            to="/warden/dashboard"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/dashboard")}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Overview</span>
          </Link>
          <Link
            to="/warden/approvals"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/approvals")}`}
          >
            <FileCheck className="w-5 h-5" />
            <span className="font-medium text-sm">Pass Requests</span>
          </Link>
          <Link
            to="/warden/requests"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/requests")}`}
          >
            <FileEdit className="w-5 h-5" />
            <span className="font-medium text-sm">Edit Requests</span>
          </Link>
          <Link
            to="/warden/students"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/students")}`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium text-sm">Student Database</span>
          </Link>
          <Link
            to="/warden/security"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/security")}`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium text-sm">Security Guard</span>
          </Link>
          <Link
            to="/warden/defaulters"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/defaulters")}`}
          >
            <AlertOctagon className="w-5 h-5" />
            <span className="font-medium text-sm">Defaulters</span>
          </Link>
          
          {/* New Profile Link */}
          <Link
            to="/warden/profile"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/warden/profile")}`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-sm">My Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
              WK
            </div>
            <div>
              <p className="text-sm font-bold">{user?.name || "Warden"}</p>
              <p className="text-xs text-slate-500">{user?.assignedBlock || "Hostel"}</p>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {getHeaderTitle()}
          </h2>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentDate}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default WardenLayout;