import React, { useState } from "react";
import { ShieldCheck, ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { axiosInstance } from "../../lib/axios";

const StudentLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    regNo: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login Attempt:", formData);
    try {
      const res = await axiosInstance.post("/auth/studentSignin", formData);
      if (res.data.success) {
        toast.success("Login successful!");
        login(res.data.user);
        navigate("/student/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
      console.error(err);
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 antialiased min-h-screen flex flex-col relative selection:bg-blue-100 font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-blue-50 -z-10"></div>
      {/* Navigation */}
      <nav className="w-full h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Smart Outpass
          </span>
        </div>
        <a
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>
      </nav>

      {/* Main Content */}
      <main className="grow flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Student Portal</h1>
          <p className="mt-2 text-slate-500">
            Please sign in to access your dashboard.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
          <div className="h-1.5 w-full bg-blue-600"></div>

          <div className="p-8 pt-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Registration Number Input */}
              <div>
                <label
                  htmlFor="regNo"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="regNo"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition sm:text-sm"
                    placeholder="e.g. 21BCE1045"
                  />
                </div>
              </div>
              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition sm:text-sm"
                    placeholder="••••••••"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Sign in securely
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; 2025 Smart Outpass Management System.
          <br />
          Unauthorized access is prohibited.
        </p>
      </main>
    </div>
  );
};

export default StudentLoginPage;
