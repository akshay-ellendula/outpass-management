import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Settings,
  LogOut,
  GraduationCap,
  Ticket,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStaff: 0,
    totalStaff: 0,
    totalPassesToday: 0,
    activeDefaulters: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/dashboard-stats");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <Link to="/admin/dashboard" className="bg-blue-50 text-blue-600 border-r-4 border-blue-600 w-full flex items-center gap-3 px-6 py-3 transition">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">User Management</p>
          <Link to="/admin/wardens" className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition">
            <UserCog className="w-5 h-5" />
            <span className="font-medium text-sm">Wardens</span>
          </Link>
          <Link to="/admin/guards" className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition">
            <Shield className="w-5 h-5" />
            <span className="font-medium text-sm">Security Guards</span>
          </Link>
          <Link to="/admin/students" className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition">
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium text-sm">Students</span>
          </Link>

          <p className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Configuration</p>
          <Link to="/admin/reports" className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition">
            <FileText className="w-5 h-5" />
            <span className="font-medium text-sm">Reports</span>
          </Link>
          <Link to="/admin/settings" className="w-full flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Global Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">AD</div>
            <div>
              <p className="text-sm font-bold text-slate-800">Administrator</p>
              <p className="text-[10px] text-slate-500 uppercase">Super Admin</p>
            </div>
          </div>
          <button onClick={() => alert("Sign out logic here")} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">System Overview</h2>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{currentDate}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Students</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalStudents}</p>
                  <p className="text-xs text-slate-400 mt-1">Across Hostels</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><GraduationCap className="w-6 h-6" /></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Staff Active</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeStaff}<span className="text-lg text-slate-400 font-medium">/{stats.totalStaff}</span></p>
                  <p className="text-xs text-slate-400 mt-1">Wardens & Guards</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users className="w-6 h-6" /></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Passes Today</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPassesToday}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Ticket className="w-6 h-6" /></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">System Alerts</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeDefaulters}</p>
                  <p className="text-xs text-slate-400 mt-1">Active Defaulters</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertTriangle className="w-6 h-6" /></div>
              </div>
            </div>
          </div>

          {/* Graph Section */}
          <div className="gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Weekly Outpass Volume</h3>
                <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="flex items-end justify-between h-48 gap-2 pt-4 px-2">
                {[40, 55, 35, 45, 85, 95, 75].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 w-full group">
                    <div className="w-full bg-blue-50 rounded-t-lg h-full relative group-hover:bg-blue-100 transition">
                      <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500" style={{ height: `${h}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-500 font-bold">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Recent Administrative Actions</h3>
              <Link to="/admin/logs" className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${
                            log.action === 'CHECK_OUT' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            log.action === 'DENIED' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{log.user}</td>
                        <td className="px-6 py-4 text-xs">{log.role}</td>
                        <td className="px-6 py-4 text-slate-500">{log.details}</td>
                        <td className="px-6 py-4 text-right font-mono text-xs">
                          {formatDistanceToNow(new Date(log.time), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-500">No recent activity.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;