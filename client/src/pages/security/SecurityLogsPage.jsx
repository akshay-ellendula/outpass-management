import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  ArrowLeft, 
  XCircle, 
  Calendar 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";

const SecurityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(""); // CHECK_IN, CHECK_OUT, DENIED
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [filterType, dateFilter]); // Auto-refresh on filter change

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filterType) query.append("type", filterType);
      if (dateFilter) query.append("date", dateFilter);
      if (search) query.append("search", search);

      const res = await axiosInstance.get(`/gate/logs?${query.toString()}`);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error("Fetch Logs Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-8rem)]">
      
      {/* Header & Filters */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Roll Number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 transition"
          />
        </form>

        {/* Filters */}
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="">All Actions</option>
            <option value="CHECK_IN">Check IN</option>
            <option value="CHECK_OUT">Check OUT</option>
            <option value="DENIED">Denied</option>
          </select>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Roll No</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Gate</th>
              <th className="px-6 py-4">Guard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No logs found for this criteria.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {format(new Date(log.timestamp), "h:mm a")}
                    <span className="block text-[10px] text-slate-400">{format(new Date(log.timestamp), "MMM d")}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{log.studentId?.name || "Unknown"}</td>
                  <td className="px-6 py-4 font-mono">{log.studentId?.regNo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border inline-flex items-center gap-1 ${
                        log.scanType === 'CHECK_OUT' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        log.scanType === 'CHECK_IN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {log.scanType === 'CHECK_OUT' && <ArrowRight className="w-3 h-3" />}
                      {log.scanType === 'CHECK_IN' && <ArrowLeft className="w-3 h-3" />}
                      {log.scanType === 'DENIED' && <XCircle className="w-3 h-3" />}
                      {log.scanType.replace('_', ' ')}
                    </span>
                    {log.comment && log.comment !== 'Standard' && (
                        <span className="block text-[10px] text-red-500 font-bold mt-1">{log.comment}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.gateLocation}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{log.guardId?.name || "System"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Mock) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
        <button disabled className="px-3 py-1 border border-slate-200 rounded bg-white text-slate-400 text-xs font-bold disabled:opacity-50">Prev</button>
        <button disabled className="px-3 py-1 border border-slate-200 rounded bg-white text-slate-400 text-xs font-bold disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default SecurityLogsPage;