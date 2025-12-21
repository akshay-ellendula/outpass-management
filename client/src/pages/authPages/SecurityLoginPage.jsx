import React, { useState } from "react";
import { Link } from "react-router"; // or 'react-router-dom' depending on your version
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { axiosInstance } from "../../lib/axios";

const SecurityLoginPage = () => {
  const [formData, setFormData] = useState({
    gateId: "",
    passcode: "",
  });
  const [showPasscode, setShowPasscode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Security Login Attempt:", formData);
    try {
      // Adjusted endpoint for security personnel
      const res = await axiosInstance.post("/auth/securitySignin", formData);
      if (res.data.success) {
        toast.success("Gate access granted!");
        login(res.data.user);
        // Navigate to the scanner or security dashboard
        navigate("/security/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Access denied. Check credentials."
      );
      console.error(err);
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 antialiased min-h-screen flex flex-col relative font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-blue-50 -z-10"></div>

      {/* Navigation */}
      <nav className="w-full h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Smart Outpass
          </span>
        </div>

        <Link
          to="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="grow flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Security Gate</h1>
          <p className="mt-2 text-slate-500">Access scanner and entry logs.</p>
        </div>

        <div className="w-full max-w-105 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
          <div className="h-1.5 w-full bg-blue-600"></div>
          <div className="p-8 pt-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Gate / Guard ID Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Gate / Guard ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="gateId"
                    value={formData.gateId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition sm:text-sm"
                    placeholder="e.g. GATE-01"
                    required
                  />
                </div>
              </div>

              {/* Passcode Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type={showPasscode ? "text" : "password"}
                    name="passcode"
                    value={formData.passcode}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition sm:text-sm"
                    placeholder="••••"
                    required
                  />
                  {/* Passcode Toggle Button */}
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPasscode(!showPasscode)}
                  >
                    {showPasscode ? (
                      <svg
                        className="h-5 w-5 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-slate-400 hover:text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center"></div>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Launch Scanner
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  System Status
                </span>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
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

export default SecurityLoginPage;
