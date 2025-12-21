import React from "react";
import { Link, Outlet, useLocation } from "react-router"; // react-router-dom v6
import { 
  ShieldCheck, 
  QrCode, 
  History, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  MapPin,
  User 
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const SecurityLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
  };

  const isActive = (path) => {
    return location.pathname.includes(path)
      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased h-screen flex overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">Gate Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <Link to="/security/dashboard" className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive('/security/dashboard')}`}>
            <QrCode className="w-5 h-5" />
            <span className="font-medium text-sm">Scan & Verify</span>
          </Link>
          <Link to="/security/logs" className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive('/security/logs')}`}>
            <History className="w-5 h-5" />
            <span className="font-medium text-sm">Log History</span>
          </Link>
          <Link to="/security/profile" className={`w-full flex items-center gap-3 px-6 py-3 transition ${isActive('/security/defaulters')}`}>
            <User className="w-5 h-5" />
            <span className="font-medium text-sm">Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
              {user?.name?.substring(0,2).toUpperCase() || 'GD'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name || 'Guard'}</p>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> On Duty
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-red-50 text-red-600 p-1 rounded"><MapPin className="w-4 h-4" /></span> 
            {user?.gateLocation || "Gate 1 (Main)"}
          </h2>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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

export default SecurityLayout;