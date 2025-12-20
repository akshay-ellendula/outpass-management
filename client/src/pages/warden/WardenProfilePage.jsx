import React, { useEffect, useState } from "react";
import { 
  Building, 
  Users, 
  ShieldCheck, 
  Phone, 
  Mail, 
  IdCard, 
  Calendar, 
  Lock 
} from "lucide-react"; // Fixed imports to standard Lucide icons

import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const WardenProfilePage = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Password Form State
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/warden/profile");
      if (res.data.success) {
        setProfile(res.data.data);
        setFormData({
            name: res.data.data.name,
            phone: res.data.data.phone,
            email: res.data.data.email
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put("/warden/profile", formData);
      if (res.data.success) {
        toast.success("Profile updated successfully");
        setProfile({ ...profile, ...formData });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if(passwordData.newPassword !== passwordData.confirmPassword) {
        return toast.error("Passwords do not match");
    }
    try {
        await axiosInstance.put("/warden/profile", { newPassword: passwordData.newPassword });
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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left Column: ID Card & Jurisdiction */}
      <div className="space-y-6">
        
        {/* ID Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl font-bold text-blue-600 mb-4 border-4 border-white shadow-lg shadow-blue-100">
            {profile.name.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
          <p className="text-sm text-slate-500 mb-4">Warden • {profile.assignedBlock}</p>
          
          <div className="w-full border-t border-slate-100 py-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2"><IdCard size={16} /> Employee ID</span>
              <span className="font-mono font-medium text-slate-700">{profile.empId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2"><Calendar size={16} /> Joined</span>
              <span className="font-medium text-slate-700">{new Date(profile.createdAt).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2"><ShieldCheck size={16} /> Status</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Active</span>
            </div>
          </div>
        </div>

        {/* Jurisdiction */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Assigned Jurisdiction</h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{profile.assignedBlock}</p>
              <p className="text-xs text-slate-500">Main Block</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{profile.studentCount || 0} Students</p>
              <p className="text-xs text-slate-500">Currently Assigned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Personal Info & Settings */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
            <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 text-sm font-bold hover:underline"
            >
                {isEditing ? "Cancel" : "Edit Details"}
            </button>
          </div>
          
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                <input 
                    type="text" 
                    value={isEditing ? formData.name : profile.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    readOnly={!isEditing}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-700 ${isEditing ? "border-blue-300 bg-white" : "border-slate-200 bg-slate-50"}`} 
                />
            </div>
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Official Email</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="email" 
                        value={isEditing ? formData.email : profile.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 ${isEditing ? "border-blue-300 bg-white" : "border-slate-200 bg-slate-50"}`} 
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text" 
                        value={isEditing ? formData.phone : profile.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 ${isEditing ? "border-blue-300 bg-white" : "border-slate-200 bg-slate-50"}`} 
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Office Location</label>
                <input type="text" value="Ground Floor, Main Office" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" readOnly />
            </div>

            {isEditing && (
                <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm">Save Changes</button>
                </div>
            )}
          </form>
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

export default WardenProfilePage;