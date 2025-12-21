import React, { useEffect, useState } from "react";
import { Link } from "react-router"; // Assuming react-router-dom v6
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  ShieldCheck, 
  IdCard, 
  Calendar, 
  Lock,
  Users
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const StudentProfilePage = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password Form State
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/student/profile");
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if(passwordData.newPassword !== passwordData.confirmPassword) {
        return toast.error("Passwords do not match");
    }
    try {
        // You might need a specific endpoint for student password update if different
        await axiosInstance.put("/student/profile/password", { newPassword: passwordData.newPassword });
        toast.success("Password updated");
        setShowPassword(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
        toast.error("Password update failed");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left Column: ID Card & Hostel Info */}
      <div className="space-y-6">
        
        {/* ID Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl font-bold text-blue-600 mb-4 border-4 border-white shadow-lg shadow-blue-100">
            {profile.name.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
          <p className="text-sm text-slate-500 mb-4">Student • {profile.branch}</p>
          
          <div className="w-full border-t border-slate-100 py-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2"><IdCard size={16} /> Roll Number</span>
              <span className="font-mono font-medium text-slate-700">{profile.regNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2"><Calendar size={16} /> Year</span>
              <span className="font-medium text-slate-700">{profile.year || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2"><ShieldCheck size={16} /> Status</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile.isDefaulter ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {profile.isDefaulter ? "Defaulter" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Hostel Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Hostel Details</h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MapPin size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{profile.hostelBlock}</p>
              <p className="text-xs text-slate-500">Block Name</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Room {profile.roomNo}</p>
              <p className="text-xs text-slate-500">Room Number</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Personal Info & Settings */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Personal Information (Read Only with Request Edit) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            <Link 
                to="/student/profile/edit"
                className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"
            >
                <Edit size={14} /> Request Change
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                <div className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                    {profile.name}
                </div>
            </div>
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Student Email</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <div className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                        {profile.email}
                    </div>
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <div className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                        {profile.phone}
                    </div>
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Branch</label>
                <div className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                    {profile.branch}
                </div>
            </div>
          </div>

          {/* Guardian Details Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> Guardian Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guardian Name</label>
                    <div className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                        {profile.parentName}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guardian Phone</label>
                    <div className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                        {profile.parentPhone}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guardian Email</label>
                    <div className="w-full border rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 border-slate-200">
                        {profile.parentEmail}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Security Settings</h3>
          
          {!showPassword ? (
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                    <p className="font-bold text-sm text-slate-800">Change Password</p>
                    <p className="text-xs text-slate-500">Secure your account regularly.</p>
                </div>
                <button onClick={() => setShowPassword(true)} className="border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50">Update</button>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">New Password</label>
                        <input 
                            type="password" 
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Confirm</label>
                        <input 
                            type="password" 
                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                    <button type="button" onClick={() => setShowPassword(false)} className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3">Cancel</button>
                    <button type="submit" className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded font-bold">Update Password</button>
                </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentProfilePage;