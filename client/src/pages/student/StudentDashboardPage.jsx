import React, { useEffect, useState } from "react";
import { Link } from "react-router"; // Use 'react-router-dom' if v6
import { 
  PlusCircle, 
  FileText, 
  Hourglass, 
  CheckCircle, 
  XCircle, 
  List, 
  ClipboardList, 
  Sun, 
  Home, 
  ChevronRight, 
  X 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const StudentDashboardPage = () => {
  const [data, setData] = useState({
    stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/student/dashboard");
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper for Status Badge
const getStatusBadge = (status) => {
  const baseClasses = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium";

  switch (status) {
    // --- ACTIVE / POSITIVE ---
    case "APPROVED":
      return (
        <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>
          Approved
        </span>
      );
    case "CURRENTLY_OUT":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          Out Now
        </span>
      );

    // --- PENDING STAGES ---
    case "PENDING_GUARDIAN":
      return (
        <span className={`${baseClasses} bg-orange-100 text-orange-700`}>
          Parent Wait
        </span>
      );
    case "PENDING_WARDEN":
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
          Warden Wait
        </span>
      );
    case "PENDING":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>
          Pending
        </span>
      );

    // --- NEGATIVE / INACTIVE ---
    case "REJECTED":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-700`}>
          Rejected
        </span>
      );
    case "EXPIRED":
      return (
        <span className={`${baseClasses} bg-stone-100 text-stone-600`}>
          Expired
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-500`}>
          Cancelled
        </span>
      );
    
    // --- HISTORY ---
    case "COMPLETED":
      return (
        <span className={`${baseClasses} bg-slate-100 text-slate-600`}>
          Returned
        </span>
      );

    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-600`}>
          {status}
        </span>
      );
  }
};

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <>
      {/* Header & Apply Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back! Manage your outings here.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto group bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Apply Outpass
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total" value={data.stats.total} icon={<FileText className="w-6 h-6" />} color="slate" />
        <StatCard title="Pending" value={data.stats.pending} icon={<Hourglass className="w-6 h-6" />} color="blue" />
        <StatCard title="Approved" value={data.stats.approved} icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
        <StatCard title="Rejected" value={data.stats.rejected} icon={<XCircle className="w-6 h-6" />} color="red" />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <List className="w-5 h-5 text-slate-500" /> Recent Activity
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wide">
                <th className="px-6 py-4">Type / Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Timing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {req.type === 'Day Pass' ? 
                          <Sun className="w-5 h-5 text-blue-500" /> : 
                          <Home className="w-5 h-5 text-emerald-500" />
                        }
                        <span className="font-bold text-slate-700">{req.type}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 ml-7">
                        {format(new Date(req.createdAt), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium line-clamp-1">{req.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-700">Out:</span> {req.outTime ? format(new Date(req.outTime), "h:mm a") : "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-700">In:</span> &nbsp;&nbsp;{req.inTime ? format(new Date(req.inTime), "h:mm a") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        to={`/student/pass/${req._id}?type=${req.type}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardList className="w-10 h-10 text-slate-300" />
                      <p className="font-medium">No requests found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Select Pass Type</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <Link to="/student/apply/day" className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 bg-white hover:bg-blue-50/50 transition-all duration-300 text-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <Sun className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Day Pass</h4>
                  <p className="text-sm text-slate-500 mb-4">Local outings (5AM - 9PM). Same day return.</p>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">Select &rarr;</span>
                </Link>

                <Link to="/student/apply/home" className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 transition-all duration-300 text-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors duration-300">
                    <Home className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Home Pass</h4>
                  <p className="text-sm text-slate-500 mb-4">Overnight stays & weekends. Requires Guardian approval.</p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">Select &rarr;</span>
                </Link>

              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">Please ensure you are not a Defaulter before applying.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Sub-component for Stats
const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  const textColors = {
    slate: "text-slate-500",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    red: "text-red-600"
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${textColors[color]}`}>{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;