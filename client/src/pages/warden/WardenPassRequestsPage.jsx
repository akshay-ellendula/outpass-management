import React, { useEffect, useState } from "react";
import { 
  Search, 
  ChevronDown, 
  Sun, 
  Home, 
  Check, 
  X, 
  Filter 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const WardenPassRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All Types");

  // Fetch Requests
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get("/warden/pass-requests");
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve/Reject
  const handleAction = async (id, type, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this request?`)) return;

    try {
      // Optimistic UI Update: Remove from list immediately
      setRequests((prev) => prev.filter((req) => req._id !== id));

      const res = await axiosInstance.put(`/warden/pass-requests/${id}`, {
        action: action, // 'APPROVE' or 'REJECT'
        type: type // 'Day Pass' or 'Home Pass'
      });

      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        // Revert if failed (optional, simplifed here)
        fetchRequests(); 
        toast.error("Action failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
      fetchRequests(); // Revert state
    }
  };

  // Filtering
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "All Types" || req.type === filterType;

    return matchesSearch && matchesType;
  });

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;

  return (
    <>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80 shadow-sm transition"
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full sm:w-auto"
          >
            <option>All Types</option>
            <option>Day Pass</option>
            <option>Home Pass</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
              
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm border ${
                req.type === 'Home Pass' 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {req.studentName.substring(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {req.studentName} 
                      <span className="text-sm font-normal text-slate-500 font-mono ml-1">{req.regNo}</span>
                    </h3>
                    <p className="text-sm text-slate-500">{req.hostelInfo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    req.type === 'Home Pass' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {req.type === 'Home Pass' ? <Home className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    {req.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {req.type === 'Home Pass' ? 'Leaving' : 'Time Out'}
                    </p>
                    <p className="font-semibold text-slate-900 text-sm">
                      {req.timeOut ? format(new Date(req.timeOut), "MMM d, h:mm a") : '-'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {req.type === 'Home Pass' ? 'Returning' : 'Time In'}
                    </p>
                    <p className="font-semibold text-slate-900 text-sm">
                      {req.timeIn ? format(new Date(req.timeIn), "MMM d, h:mm a") : '-'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                    <p className="font-semibold text-slate-900 text-sm truncate" title={req.reason}>
                      {req.reason}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction(req._id, req.type, 'APPROVE')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-blue-600/20 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(req._id, req.type, 'REJECT')}
                    className="bg-white border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
            <p>No pending requests found.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default WardenPassRequestsPage;