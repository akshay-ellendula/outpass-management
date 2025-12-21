import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  LogOut 
} from "lucide-react";
import { Link } from "react-router"; // Ensure react-router-dom is used
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

const SecurityProfilePage = () => {
  const { user } = useAuth(); // Assuming auth context provides basic user info
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Password State
  const [isEditingPass, setIsEditingPass] = useState(false);
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/gate/profile");
        if (res.data.success) {
          setProfile(res.data.data);
          setFormData({
            name: res.data.data.name,
            phone: res.data.data.phone || "",
            email: res.data.data.email || ""
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Update Logic
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you'd send this to an update endpoint
      const res = await axiosInstance.put("/gate/profile", formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setProfile({ ...profile, ...formData }); // Optimistic update
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Password Logic
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    try {
      await axiosInstance.put("/gate/profile/password", { 
        newPassword: passwordData.newPassword 
      });
      toast.success("Password changed successfully!");
      setIsEditingPass(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Password update failed");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header (Inside Main Content Area) */}
      {/* Note: The Layout component usually handles the main header, but we can customize or override content here if your routing allows */}
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-4xl border border-slate-200 select-none">
            👮‍♂️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-slate-500 text-sm">Senior Security Guard</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span> Active Status
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-mono text-slate-500">ID: {profile.guardId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Information</h3>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              Edit Details
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
              <input 
                type="text" 
                value={isEditing ? formData.name : profile.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                readOnly={!isEditing}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                  isEditing 
                    ? "bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 border-blue-300" 
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Employee ID</label>
              <input 
                type="text" 
                value={profile.guardId} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                readOnly 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date Joined</label>
              <input 
                type="text" 
                value={format(new Date(profile.createdAt), "dd MMM, yyyy")} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                readOnly 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
              <input 
                type="text" 
                value={isEditing ? formData.phone : (profile.phone || "N/A")}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                readOnly={!isEditing}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                  isEditing 
                    ? "bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 border-blue-300" 
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Address</label>
              <input 
                type="email" 
                value={isEditing ? formData.email : (profile.email || "N/A")}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                readOnly={!isEditing}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
                  isEditing 
                    ? "bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 border-blue-300" 
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Assigned Location</label>
              <input 
                type="text" 
                value={profile.gateLocation} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                readOnly 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Shift</label>
              <input 
                type="text" 
                value={profile.shift} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                readOnly 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Supervisor</label>
              <input 
                type="text" 
                value="Warden Kumar (BH1)" 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" 
                readOnly 
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); setFormData({ name: profile.name, phone: profile.phone, email: profile.email }); }}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Login Security</h3>
        
        {!isEditingPass ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800">Password</p>
              <p className="text-xs text-slate-500">Last changed 3 months ago</p>
            </div>
            <button 
              onClick={() => setIsEditingPass(true)} 
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Lock className="w-3 h-3" /> Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="mt-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="submit" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow-md"
                >
                  Update Password
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditingPass(false)} 
                  className="border border-slate-300 text-slate-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SecurityProfilePage;