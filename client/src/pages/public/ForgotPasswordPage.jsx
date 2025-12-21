import React, { useState } from "react";
import { Link } from "react-router"; 
import { Mail, ArrowLeft, CheckCircle, User, Shield, Key } from "lucide-react";
import { axiosInstance } from "../../lib/axios"; 
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      // Send role along with email
      console.log("Submitting forgot password for:", { email, role });
      const res = await axiosInstance.post("/auth/forgot-password", { email, role });
      
      if (res.data.success) {
        setEmailSent(true);
        toast.success(`Reset link sent to ${role} email!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col relative font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 -z-10"></div>

      <nav className="w-full h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">Smart Outpass</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
          <p className="mt-2 text-slate-500">Select your role and enter email to continue.</p>
        </div>

        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden relative">
          <div className="h-1.5 w-full bg-blue-600"></div>
          <div className="p-8 pt-10">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {['student', 'warden', 'security'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`text-xs font-bold py-2 rounded-md capitalize transition ${
                          role === r ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Registered Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition sm:text-sm" 
                      placeholder={role === 'admin' ? "admin@university.edu" : "user@university.edu"}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70"
                >
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Check your mail</h3>
                <p className="text-slate-500 mt-2 text-sm mb-6">
                  We have sent instructions to <strong>{email}</strong>.
                </p>
                <button onClick={() => setEmailSent(false)} className="text-blue-600 font-bold text-sm hover:underline">
                  Try another email
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;