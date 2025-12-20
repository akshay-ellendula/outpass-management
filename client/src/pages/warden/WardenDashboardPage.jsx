import React, { useEffect, useState } from "react";
import { 
  Clock, 
  FileEdit, 
  DoorOpen, 
  AlertTriangle, 
  List, 
  ChevronDown 
} from "lucide-react"; // Switched to Lucide
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const WardenDashboardPage = () => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    studentsOut: 0,
    activeDefaulters: 0,
    recentMovements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/warden/dashboard-stats");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pending Requests</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Edit Requests</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <FileEdit className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Students Out</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.studentsOut}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <DoorOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Active Defaulters</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeDefaulters}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-96">
        
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/50 gap-4">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-800">Recent Movements</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm">
                <option>Filter by Status</option>
                <option>All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-bold text-slate-500 tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Pass Type</th>
                <th className="px-6 py-4">Exit Time</th>
                <th className="px-6 py-4">Expected Return</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.recentMovements.length > 0 ? (
                stats.recentMovements.map((move) => (
                  <tr key={move._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{move.studentName}</p>
                      <p className="text-xs text-slate-500 font-mono">{move.regNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        move.type === 'Home Pass' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {move.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {move.exitTime ? format(new Date(move.exitTime), 'hh:mm a, MMM d') : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {move.returnTime ? format(new Date(move.returnTime), 'hh:mm a, MMM d') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {move.isOut ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> OUT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          {move.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No recent activity.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default WardenDashboardPage;