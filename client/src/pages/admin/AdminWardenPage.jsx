import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  LayoutDashboard,
  UserCog,
  FileText,
  Settings,
  LogOut,
  Search,
  Plus,
  Phone,
  GraduationCap,
  Building
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const AdminWardenPage = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Wardens
  useEffect(() => {
    const fetchWardens = async () => {
      try {
        const res = await axiosInstance.get("/admin/wardens");
        if (res.data.success) {
          setWardens(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load wardens");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWardens();
  }, []);

  // Filter Logic
  const filteredWardens = wardens.filter(
    (warden) =>
      warden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warden.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warden.assignedBlock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper for random color generation for avatars
  const getAvatarColor = (index) => {
    const colors = [
      "bg-blue-50 text-blue-600 border-blue-100",
      "bg-purple-50 text-purple-600 border-purple-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-orange-50 text-orange-600 border-orange-100",
    ];
    return colors[index % colors.length];
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
            className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
            User Management
          </p>
          <Link
            to="/admin/wardens"
            className="bg-blue-50 text-blue-600 border-r-4 border-blue-600 w-full flex items-center gap-3 px-6 py-3 transition"
          >
            <UserCog className="w-5 h-5" />
            <span className="font-medium text-sm">Wardens</span>
          </Link>
          <Link
            to="/admin/guards"
            className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium text-sm">Security Guards</span>
          </Link>
          <Link
            to="/admin/students"
            className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium text-sm">Students</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
            Configuration
          </p>
          <Link
            to="/admin/reports"
            className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium text-sm">Reports</span>
          </Link>
          <Link
            to="/admin/settings"
            className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Global Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
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
            onClick={() => toast.success("Signed out")}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition text-sm font-medium mt-3"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">
            Warden Management
          </h2>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentDate}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search warden..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <Link
              to="/admin/wardens/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Add Warden
            </Link>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWardens.length > 0 ? (
                filteredWardens.map((warden, index) => (
                  <div
                    key={warden._id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition group"
                  >
                    {/* Avatar */}
                    <div
                      className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center text-2xl font-bold border ${getAvatarColor(
                        index
                      )}`}
                    >
                      {getInitials(warden.name)}
                    </div>

                    <h4 className="font-bold text-slate-900">{warden.name}</h4>
                    <p className="text-xs text-slate-500 mb-4">
                      ID: {warden.empId} •{" "}
                      <span
                        className={
                          warden.isActive ? "text-emerald-600 font-bold" : "text-red-500 font-bold"
                        }
                      >
                        {warden.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>

                    {/* Details Box */}
                    <div className="w-full bg-slate-50 rounded-lg p-3 mb-4 text-left border border-slate-100 group-hover:bg-blue-50/50 transition">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3" /> Assigned To
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {warden.assignedBlock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {warden.phone}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-2">
                      <button className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition">
                        Edit
                      </button>
                      <button className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition">
                        Reassign
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-slate-500">
                  <p>No wardens found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminWardenPage;