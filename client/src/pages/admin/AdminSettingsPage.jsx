import React, { useEffect, useState } from "react";
import { Siren, HouseLine, WarningCircle, SignOut } from "@phosphor-icons/react"; // Using Phosphor Icons as per your HTML
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AdminSettingsPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [settings, setSettings] = useState({
    emergencyFreeze: false,
    dayPassStartTime: "06:00",
    dayPassEndTime: "21:00",
    autoMarkDefaulters: true,
    homePassAutoApprove: false,
    dayPassAutoApprove: false
  });

  // Password Form State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch Settings on Load
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/admin/settings");
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle Toggle & Input Changes for Settings
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle Save Settings
  const saveSettings = async () => {
    try {
      const res = await axiosInstance.put("/admin/settings", settings);
      if (res.data.success) {
        toast.success("Configuration Updated!");
        setSettings(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const res = await axiosInstance.put("/admin/change-password", {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      
      if (res.data.success) {
        toast.success("Password Updated Successfully!");
        setShowPasswordForm(false);
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="mx-auto space-y-6 max-w-4xl">
      
      {/* Emergency Freeze Section */}
      <div className={`bg-white rounded-xl border shadow-sm p-6 relative overflow-hidden transition-all ${settings.emergencyFreeze ? 'border-red-400' : 'border-slate-200'}`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${settings.emergencyFreeze ? 'bg-red-600' : 'bg-slate-300'}`}></div>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${settings.emergencyFreeze ? 'text-red-700' : 'text-slate-700'}`}>
              <Siren size={24} weight="bold" /> Emergency System Freeze
            </h3>
            <p className="text-sm text-slate-500 mt-1">Suspend all new pass generation instantly. Use only in critical situations.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="emergencyFreeze"
              checked={settings.emergencyFreeze} 
              onChange={(e) => {
                handleSettingChange(e);
                // Auto-save this specific critical setting immediately
                // Or you can wait for the 'Save Changes' button
              }}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      {/* Pass Timing Rules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Pass Timing Rules</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Day Pass Start Time</label>
              <input 
                type="time" 
                name="dayPassStartTime"
                value={settings.dayPassStartTime}
                onChange={handleSettingChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" 
              />
              <p className="text-[10px] text-slate-400 mt-1">Earliest exit time allowed.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Day Pass End Time</label>
              <input 
                type="time" 
                name="dayPassEndTime"
                value={settings.dayPassEndTime}
                onChange={handleSettingChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700" 
              />
              <p className="text-[10px] text-slate-400 mt-1">Latest return time (Curfew).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automation & Policy */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Automation & Policy</h3>
        
        <div className="space-y-5">
          {/* Auto Mark Defaulters */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <WarningCircle size={18} weight="fill" className="text-orange-500" /> Auto-Mark Defaulters
              </p>
              <p className="text-xs text-slate-500 mt-0.5">If enabled, students returning after <span className="font-mono font-bold">End Time</span> are automatically flagged.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="autoMarkDefaulters"
                checked={settings.autoMarkDefaulters}
                onChange={handleSettingChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Home Pass Auto Approval */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HouseLine size={18} weight="fill" className="text-purple-600" /> Home Pass Auto-Approval
              </p>
              <p className="text-xs text-slate-500 mt-0.5">If enabled, passes verified by parents via Email/OTP are <span className="font-bold text-slate-700">automatically approved</span>.</p>
              <p className="text-[10px] text-purple-600 font-bold mt-0.5 bg-purple-50 inline-block px-1.5 py-0.5 rounded">No Warden Action Required</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="homePassAutoApprove"
                checked={settings.homePassAutoApprove}
                onChange={handleSettingChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Day Pass Auto Approval */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HouseLine size={18} weight="fill" className="text-purple-600" /> Day Pass Auto-Approval
              </p>
              <p className="text-xs text-slate-500 mt-0.5">If enabled, passes verified by parents via Email/OTP are <span className="font-bold text-slate-700">automatically approved</span>.</p>
              <p className="text-[10px] text-purple-600 font-bold mt-0.5 bg-purple-50 inline-block px-1.5 py-0.5 rounded">No Warden Action Required</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="dayPassAutoApprove"
                checked={settings.dayPassAutoApprove}
                onChange={handleSettingChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
          <button 
            onClick={saveSettings} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Admin Account Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Admin Account</h3>
        
        {!showPasswordForm ? (
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm font-bold text-slate-800">Super Admin Password</p>
              <p className="text-xs text-slate-500">Secure your account regularly.</p>
            </div>
            <button 
              onClick={() => setShowPasswordForm(true)} 
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 transition-all">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Password</label>
                <input 
                  type="password" 
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Password</label>
                  <input 
                    type="password" 
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm</label>
                  <input 
                    type="password" 
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordForm(false)} 
                  className="text-slate-500 font-bold text-xs hover:text-slate-800 px-3 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-slate-800"
                >
                  Update Password
                </button>
              </div>
            </div>
          </form>
        )}

        <button 
          onClick={logout}
          className="w-full bg-red-50 text-red-600 border border-red-100 font-bold py-2.5 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
        >
          <SignOut size={18} weight="bold" /> Log Out
        </button>
      </div>

    </div>
  );
};

export default AdminSettingsPage;