import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Users,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Total Students
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.totalStudents}
              </p>
              <p className="text-xs text-slate-400 mt-1">Across Hostels</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Staff Active */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Staff Active
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.activeStaff}
                <span className="text-lg text-slate-400 font-medium">
                  /{stats.totalStaff}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Wardens & Guards</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Passes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Total Passes Today
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.totalPassesToday}
              </p>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                System Alerts
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.activeDefaulters}
              </p>
              <p className="text-xs text-slate-400 mt-1">Active Defaulters</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
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
              <div
                key={i}
                className="flex flex-col items-center gap-2 w-full group"
              >
                <div className="w-full bg-blue-50 rounded-t-lg h-full relative group-hover:bg-blue-100 transition">
                  <div
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 font-bold">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">
            Recent Administrative Actions
          </h3>
          <Link
            to="/admin/logs"
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${
                          log.action === "CHECK_OUT"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : log.action === "DENIED"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 text-xs">{log.role}</td>
                    <td className="px-6 py-4 text-slate-500">{log.details}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      {formatDistanceToNow(new Date(log.time), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-slate-500"
                  >
                    No recent activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;