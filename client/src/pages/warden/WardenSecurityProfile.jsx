import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Save, 
  Clock,
  MapPin,
  Shield
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const WardenSecurityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guard, setGuard] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/warden/guards/${id}`);
        if (res.data.success) {
            setGuard(res.data.data.guard);
            setLogs(res.data.data.logs);
        }
      } catch (error) {
        toast.error("Failed to load data");
        navigate("/warden/security");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setGuard({ ...guard, [e.target.name]: e.target.value });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/warden/guards/${id}`, guard);
      if(res.data.success) {
          toast.success("Guard updated successfully");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const toggleStatus = async () => {
      // Confirmation for safety
      const action = guard.isActive ? "DEACTIVATE" : "ACTIVATE";
      if(!confirm(`Are you sure you want to ${action} this guard account?`)) return;

      try {
          const res = await axiosInstance.patch(`/warden/guards/${id}/status`);
          setGuard({...guard, isActive: res.data.data.isActive});
          toast.success(`Account ${action.toLowerCase()}d`);
      } catch (error) { toast.error("Failed to change status"); }
  };

  const handleDelete = async () => {
      if(!confirm("WARNING: Are you sure you want to PERMANENTLY DELETE this guard?")) return;
      try {
          await axiosInstance.delete(`/warden/guards/${id}`);
          toast.success("Guard deleted");
          navigate("/warden/security");
      } catch (error) { toast.error("Delete failed"); }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!guard) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/warden/security" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <Shield className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{guard.name}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                {/* ID Badge */}
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                    ID: {guard.guardId}
                </span>

                {/* Account Status Badge (Corrected) */}
                <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 border ${
                    guard.isActive 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : "bg-red-50 text-red-700 border-red-100"
                }`}>
                    {guard.isActive ? (
                        <><CheckCircle className="w-3 h-3" /> Active Account</>
                    ) : (
                        <><Ban className="w-3 h-3" /> Account Disabled</>
                    )}
                </span>

                {/* Shift Info (Separate) */}
                <span className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100">
                    <Clock className="w-3 h-3" /> {guard.shift} Shift
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
                onClick={toggleStatus} 
                className={`border px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    guard.isActive
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
            >
                {guard.isActive ? <><Ban className="w-4 h-4" /> Deactivate</> : <><CheckCircle className="w-4 h-4" /> Activate</>}
            </button>
            
            <button 
                onClick={handleDelete} 
                className="bg-white text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Delete
            </button>
            
            {isEditing && (
                <button 
                    onClick={handleSave} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> Save
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">
            Guard Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                <input type="text" name="name" value={guard.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guard ID</label>
                <input type="text" value={guard.guardId} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                <input type="text" name="phone" value={guard.phone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
                <input type="email" name="email" value={guard.email} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gate Location</label>
                <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input type="text" name="gateLocation" value={guard.gateLocation} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Shift</label>
                <select name="shift" value={guard.shift} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Day">Day (8AM - 8PM)</option>
                    <option value="Night">Night (8PM - 8AM)</option>
                </select>
            </div>
        </div>
      </form>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Scanning Activity</h3>
            <span className="text-xs text-slate-500">Last 20 entries</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                        <th className="px-6 py-3">Time</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.length > 0 ? logs.map(log => (
                        <tr key={log._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono text-slate-600">
                                {format(new Date(log.timestamp), "h:mm a, MMM d")}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                    log.scanType === 'CHECK_IN' 
                                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {log.scanType === 'CHECK_IN' ? 'In Scan' : 'Out Scan'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                Processed movement
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                No recent activity logs found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default WardenSecurityProfile;