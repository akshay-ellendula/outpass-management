import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Edit2, 
  Ban, 
  CheckCircle, 
  Trash2, 
  User, 
  MapPin,
  Clock, 
  Shield,
  Save,
  X
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const AdminSecurityDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guard, setGuard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gateLocation: "",
    shift: "Day"
  });

  // Fetch Guard Details
  useEffect(() => {
    const fetchGuard = async () => {
      try {
        const res = await axiosInstance.get(`/admin/guards/${id}`);
        if (res.data.success) {
          const data = res.data.data;
          setGuard(data);
          setFormData({
            name: data.name,
            gateLocation: data.gateLocation,
            shift: data.shift
          });
        }
      } catch (error) {
        toast.error("Guard not found");
        navigate("/admin/guards");
      } finally {
        setLoading(false);
      }
    };
    fetchGuard();
  }, [id, navigate]);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Save
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await axiosInstance.put(`/admin/guards/${id}`, formData);
      if (res.data.success) {
        toast.success("Guard updated successfully");
        setGuard({ ...guard, ...formData });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update guard");
    } finally {
      setSaveLoading(false);
    }
  };

  // Cancel Editing
  const handleCancel = () => {
    setFormData({
      name: guard.name,
      gateLocation: guard.gateLocation,
      shift: guard.shift
    });
    setIsEditing(false);
  };

  // Handle Status Toggle
  const toggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${guard.isActive ? "deactivate" : "activate"} this guard?`)) return;

    try {
      const res = await axiosInstance.patch(`/admin/guards/${id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        setGuard({ ...guard, isActive: res.data.data.isActive });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!window.confirm("WARNING: Are you sure you want to delete this guard? This action cannot be undone.")) return;

    try {
      const res = await axiosInstance.delete(`/admin/guards/${id}`);
      if (res.data.success) {
        toast.success("Guard deleted successfully");
        navigate("/admin/guards");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete guard");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!guard) return null;

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/guards"
          className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Guard Details</h2>
          <p className="text-xs text-slate-500 font-medium">
            User Management &gt; {guard.name}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        
        {/* Section 1: Personal Information */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 border-b border-blue-100 pb-2">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">
              Personal Information
            </h3>
            {isEditing && (
              <span className="text-xs text-amber-600 font-bold animate-pulse">
                Editing Mode Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium transition outline-none ${
                    isEditing 
                      ? "border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500" 
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Assignment Details */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
            Assignment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guard ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4 w-4 text-purple-500" />
                </div>
                <input
                  type="text"
                  value={guard.guardId}
                  disabled // Always disabled
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm font-mono cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gate Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-purple-500" />
                </div>
                <input
                  type="text"
                  name="gateLocation"
                  value={formData.gateLocation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium transition outline-none ${
                    isEditing 
                      ? "border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500" 
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Shift</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                {isEditing ? (
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-blue-300 bg-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={`${formData.shift} Shift`}
                    disabled
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Account Actions */}
        <div>
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
            Account Actions
          </h3>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${guard.isActive ? "bg-emerald-500" : "bg-red-500"}`}></div>
                <span className="text-sm font-bold text-slate-700">
                  Current Status: <span className={guard.isActive ? "text-emerald-600" : "text-red-600"}>{guard.isActive ? "Active" : "Deactivated"}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {saveLoading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2 shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Details
                  </button>
                )}

                <button
                  onClick={toggleStatus}
                  disabled={isEditing}
                  className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm border ${
                    guard.isActive
                      ? "bg-white border-amber-200 text-amber-600 hover:bg-amber-50"
                      : "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  } ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {guard.isActive ? (
                    <><Ban className="w-4 h-4" /> Disable Account</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Activate Account</>
                  )}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isEditing}
                  className={`px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2 shadow-sm ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Trash2 className="w-4 h-4" /> Delete Guard
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSecurityDetailsPage;