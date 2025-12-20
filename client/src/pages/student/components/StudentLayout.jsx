import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router";
import { PaperPlaneTilt, SignOut } from "@phosphor-icons/react";
import { useAuth } from "../../../context/AuthContext";
import { axiosInstance } from "../../../lib/axios"; // Ensure this import exists
import toast from "react-hot-toast";

const StudentLayout = () => {
  const { logout, user } = useAuth(); // 'user' from context might be stale or incomplete
  const [profile, setProfile] = useState(user || null); // Local state for fresh data

  // Fetch fresh profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/student/profile");
        if (res.data.success) {
          setProfile(res.data.data);
          console.log("Fresh Student Data:", res.data.data);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        // Optional: toast.error("Could not sync profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
};

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "--";
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
            <PaperPlaneTilt weight="bold" className="text-white text-xl" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Smart Outpass</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            {/* Display data from local 'profile' state instead of just context 'user' */}
            <span className="text-sm font-semibold text-slate-700">
              {profile?.name || "Student"}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {profile?.regNo || "Loading..."}
            </span>
          </div>
          <div className="h-9 w-9 bg-linear-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 shadow-sm">
            {getInitials(profile?.name)}
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition p-1">
            <SignOut weight="bold" className="text-xl" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="grow container mx-auto px-4 py-8 max-w-6xl">
        {/* Pass the profile down to children if needed via Context, or just Outlet */}
        <Outlet context={{ profile }} /> 
      </main>

    </div>
  );
};

export default StudentLayout;