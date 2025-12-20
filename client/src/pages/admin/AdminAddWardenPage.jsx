import React, { useState } from "react";
import { Link, useNavigate } from "react-router"; 
import { ArrowLeft, CheckCircle } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const AdminAddWarden = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Removed empId from state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    assignedBlock: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/admin/wardens", formData);
      if (res.data.success) {
        // Show the generated ID in the success message
        toast.success(res.data.message || "Warden added successfully!");
        navigate("/admin/wardens");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to create warden account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/wardens"
          className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Register New Warden
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            User Management &gt; Add Warden
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 00000"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Official Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="warden.name@university.edu"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
              Assignment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Warden ID
                </label>
                <input
                  type="text"
                  value="Auto-generated"
                  disabled
                  className="w-full border border-slate-200 bg-slate-50 text-slate-400 rounded-lg px-3 py-2.5 text-sm cursor-not-allowed italic"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Assign Hostel
                </label>
                <select
                  name="assignedBlock"
                  value={formData.assignedBlock}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition cursor-pointer"
                  required
                >
                  <option value="">Select Hostel...</option>
                  <option value="BH1">Boys Hostel 1 (BH1)</option>
                  <option value="BH2">Boys Hostel 2 (BH2)</option>
                  <option value="GH1">Girls Hostel 1 (GH1)</option>
                  <option value="GH2">Girls Hostel 2 (GH2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2">
              Account Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Initial Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/admin/wardens"
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Creating..." : <><CheckCircle className="w-4 h-4" /> Create Account</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddWarden;