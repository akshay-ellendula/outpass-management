import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router"; // Ensure using react-router-dom
import {
  LayoutDashboard,
  User,
  LogOut,
  Send,
  Ticket,
  Edit,
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { axiosInstance } from "../../../lib/axios";
import toast from "react-hot-toast";

const StudentLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(user || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  // Fetch fresh profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/student/profile");
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, []);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "--";
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";
  };

  const getHeaderTitle = () => {
    if (location.pathname.includes("dashboard")) return "Dashboard";
    if (location.pathname.includes("apply")) return "Apply for Pass";
    if (location.pathname.includes("profile/edit")) return "Edit Profile";
    if (location.pathname.includes("profile")) return "My Profile";
    return "Student Portal";
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-slate-50 text-slate-900 antialiased h-screen flex overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col h-full ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">
              Smart Outpass
            </span>
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-red-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link
            to="/student/dashboard"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/student/dashboard")}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <Link
            to="/student/profile"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/student/profile")}`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-sm">My Profile</span>
          </Link>

          <Link
            to="/student/profile/edit"
            className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive("/student/profile/edit")}`}
          >
            <Edit className="w-5 h-5" />
            <span className="font-medium text-sm">Edit Profile</span>
          </Link>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          
          {/* Defaulter Status Banner */}
          {profile?.isDefaulter && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 leading-tight">Defaulter Active</p>
                <p className="text-[10px] text-red-600 font-medium opacity-90 mt-0.5">Passes Blocked</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-colors shrink-0 ${
              profile?.isDefaulter 
                ? "bg-red-100 text-red-700 border-red-200" 
                : "bg-blue-100 text-blue-700 border-blue-200"
            }`}>
              {getInitials(profile?.name)}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-bold truncate">
                {profile?.name || "Student"}
              </p>
              <p className="text-xs text-slate-500 font-mono truncate">
                {profile?.regNo || "Loading..."}
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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h2 className="text-lg font-bold text-slate-800 line-clamp-1">
              {getHeaderTitle()}
            </h2>
            
            {/* Optional Header Badge */}
            {profile?.isDefaulter && (
               <span className="hidden sm:flex bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200 items-center gap-1">
                 <AlertCircle className="w-3 h-3" /> Defaulter
               </span>
            )}
          </div>
          
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentDate}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 scroll-smooth">
          <Outlet context={{ profile }} />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;