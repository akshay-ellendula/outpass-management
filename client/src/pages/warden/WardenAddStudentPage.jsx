import React, { useState } from "react";
import { Link, useNavigate } from "react-router"; // Use 'react-router-dom' if using v6
import { ArrowLeft, CheckCircle, UserPlus, ShieldAlert } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const WardenAddStudentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Initial State matching Backend Controller requirements
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    email: "",
    phone: "",
    password: "", // Optional
    roomNo: "",
    year: "1st Year", // Default value
    branch: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // The backend automatically assigns the 'hostelBlock' based on the logged-in Warden
      const res = await axiosInstance.post("/warden/students", formData);
      
      if (res.data.success) {
        toast.success("Student added successfully!");
        navigate("/warden/students"); // Redirect back to list
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to add student. Please check inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/warden/students"
          className="text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
          <p className="text-sm text-slate-500 font-medium">
            Student Database &gt; Register Student
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-8"
      >
        
        {/* Section 1: Basic Information */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Student Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="regNo"
                value={formData.regNo}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                placeholder="e.g. S2023001"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roomNo"
                value={formData.roomNo}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 302"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Academic Info */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Contact */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Student Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="student@university.edu"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Student Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Academic Fields (Added) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Branch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="e.g. CSE"
              />
            </div>

          </div>
        </div>

        {/* Section 3: Parent/Guardian Details */}
        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            Parent / Guardian Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Parent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="Guardian Name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Parent Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="Guardian Phone"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                Parent Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="Guardian Email"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Account Security (Optional) */}
        <div className="mb-8">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <label className="text-xs font-bold text-amber-700 uppercase mb-1 block">
                Initial Password (Optional)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-amber-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                placeholder="Leave empty to use Roll No as default password"
              />
              <p className="text-[10px] text-amber-600 mt-1">
                If left blank, the student can log in using their Roll Number as the password.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            to="/warden/students"
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Create Student Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WardenAddStudentPage;