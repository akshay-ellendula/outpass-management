import React, { useEffect, useState } from "react";
import { 
  Search, 
  ChevronDown, 
  Info, 
  CheckCircle, 
  X 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const WardenEditRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get("/warden/profile-requests");
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    try {
      // Optimistic UI update
      setRequests(prev => prev.filter(req => req._id !== id));

      const res = await axiosInstance.put(`/warden/profile-requests/${id}`, { action });
      
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        fetchRequests(); // Revert on failure
        toast.error("Action failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
      fetchRequests();
    }
  };

  // Helper to format field names (e.g., parentPhone -> Parent Phone)
  const formatFieldName = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Filter Logic
  const filteredRequests = requests.filter(req => 
    req.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.studentId?.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-6">
        <Info className="text-blue-600 w-6 h-6 shrink-0" fill="currentColor"  />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Student Profile Modification Requests</h4>
          <p className="text-xs text-blue-800 mt-1">
            Students cannot edit their personal data directly. Verify the requested changes below before updating the database.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full sm:w-80 shadow-sm transition"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <select className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full sm:w-auto">
            <option>All Requests</option>
            <option>Pending</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 text-slate-400 w-3 h-3 pointer-events-none" />
        </div>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
            No pending profile update requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div key={req._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                PENDING REVIEW
              </div>
              
              {/* Student Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 border border-slate-200">
                  {req.studentId?.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{req.studentId?.name}</h4>
                  <p className="text-xs text-slate-500">
                    {req.studentId?.regNo} • Room {req.studentId?.roomNo}
                  </p>
                </div>
              </div>

              {/* Changes List */}
              <div className="mb-4 space-y-4">
                {Object.keys(req.updates).map((key) => (
                  <div key={key}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Field: <span className="text-slate-900">{formatFieldName(key)}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Old Value */}
                      <div className="p-2 rounded bg-red-50 border border-red-100">
                        <p className="text-[10px] font-bold text-red-500 uppercase">Old</p>
                        <p className="font-mono text-xs text-slate-700 line-through decoration-red-400 truncate" title={req.studentId[key]}>
                          {req.studentId[key] || "N/A"}
                        </p>
                      </div>
                      {/* New Value */}
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">New</p>
                        <p className="font-mono text-xs text-slate-900 font-bold truncate" title={req.updates[key]}>
                          {req.updates[key]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleAction(req._id, "APPROVE")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Verify & Update
                </button>
                <button 
                  onClick={() => handleAction(req._id, "REJECT")}
                  className="flex-1 bg-white border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default WardenEditRequestsPage;