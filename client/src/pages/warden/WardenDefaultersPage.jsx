import React, { useEffect, useState } from "react";
import { 
  Search, 
  ChevronDown, 
  AlertOctagon, 
  CheckCircle,
  Clock 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const WardenDefaultersPage = () => {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Data
  useEffect(() => {
    fetchDefaulters();
  }, []);

  const fetchDefaulters = async () => {
    try {
      const res = await axiosInstance.get("/warden/defaulters");
      if (res.data.success) {
        setDefaulters(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load defaulters list");
    } finally {
      setLoading(false);
    }
  };

  // Handle Clear Status
  const handleClear = async (id) => {
    if (!window.confirm("Are you sure you want to clear this defaulter status?")) return;

    try {
      // Optimistic UI Update
      setDefaulters((prev) => prev.filter((d) => d._id !== id));

      const res = await axiosInstance.put(`/warden/defaulters/${id}/clear`);
      
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        fetchDefaulters(); // Revert if failed
        toast.error("Action failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
      fetchDefaulters(); // Revert
    }
  };

  // Filtering
  const filteredDefaulters = defaulters.filter((d) =>
    d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search defaulter..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full sm:w-80 shadow-sm transition"
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full sm:w-auto">
            <option>Status: Active</option>
            {/* Future: Add 'Cleared' history filtering logic */}
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header / Summary */}
        <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-700">
            <AlertOctagon className="w-5 h-5 text-red-700" fill="currentColor" />
            <h3 className="font-bold">Active Defaulters List</h3>
          </div>
          <span className="text-xs font-bold bg-white text-red-600 border border-red-100 px-3 py-1 rounded-full shadow-sm">
            {filteredDefaulters.length} Students Blocked
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Late By</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading defaulters...</td></tr>
              ) : filteredDefaulters.length > 0 ? (
                filteredDefaulters.map((defaulter) => (
                  <tr key={defaulter._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{defaulter.studentName}</p>
                      <p className="text-xs text-slate-500 font-mono">{defaulter.regNo}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {format(new Date(defaulter.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {defaulter.reason}
                    </td>
                    <td className="px-6 py-4">
                      {defaulter.lateBy !== "N/A" ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-xs inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {defaulter.lateBy}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleClear(defaulter._id)}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition font-medium text-xs inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Clear Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    <p>No active defaulters found.</p>
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

export default WardenDefaultersPage;