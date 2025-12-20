import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const WardenAddSecurityPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    guardId: "",
    phone: "",
    email: "",
    gateLocation: "",
    shift: "Day (8AM - 8PM)",
    status: "Active"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/warden/guards", formData);
      if (res.data.success) {
        toast.success("Guard added successfully!");
        navigate("/warden/security");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add guard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/warden/security" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add New Security Guard</h2>
          <p className="text-sm text-slate-500">Security &gt; Add Guard</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Guard Information</h3>
          <span className="text-xs text-slate-400">* Required Fields</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name *</label>
            <input type="text" name="name" onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guard ID *</label>
            <input type="text" name="guardId" onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="SEC-..." />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number *</label>
            <input type="tel" name="phone" onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email (Optional)</label>
            <input type="email" name="email" onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Assigned Gate *</label>
            <input type="text" name="gateLocation" onChange={handleChange} required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Gate 1" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Shift Time *</label>
            <select name="shift" onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Day (8AM - 8PM)</option>
              <option>Night (8PM - 8AM)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link to="/warden/security" className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">Cancel</Link>
          <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50">
            {loading ? "Creating..." : <><CheckCircle className="w-4 h-4" /> Create Account</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WardenAddSecurityPage;