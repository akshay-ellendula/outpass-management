import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Sun, Info, CheckCircle, Lock } from "lucide-react"; // Using Lucide
import { axiosInstance } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const StudentApplyDayPass = () => {
  const { user } = useAuth(); // Assume user object has 'isDefaulter'
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    outTime: "",
    inTime: "",
    destination: "",
    reason: "",
    transport: "Walk"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/student/apply/day", formData);
      if (res.data.success) {
        setShowSuccess(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Application Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      
      {/* Navbar Back Button logic is handled by Layout usually, but added here for standalone feel */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/student/dashboard" className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition text-white">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Apply Day Pass</h1>
      </div>

      {/* Defaulter Banner */}
      {user?.isDefaulter && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
            {/* <Warning className="text-red-500 w-6 h-6 flex-shrink-0" /> */}
            <div>
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">Action Blocked</h3>
                <p className="text-sm text-red-700 mt-1">You are marked as a Defaulter. Contact Warden.</p>
            </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-8 border-b border-slate-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Day Pass Application</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
                Valid for local outings (5:00 AM - 9:00 PM). Same day return.
            </p>
        </div>

        <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Date */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Date of Outing</label>
                    <input 
                        type="date" 
                        name="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.date}
                        onChange={handleChange}
                        required
                        disabled={user?.isDefaulter}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Out Time (Min 5AM)</label>
                        <input 
                            type="time" 
                            name="outTime"
                            value={formData.outTime}
                            onChange={handleChange}
                            required
                            disabled={user?.isDefaulter}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">In Time (Max 9PM)</label>
                        <input 
                            type="time" 
                            name="inTime"
                            value={formData.inTime}
                            onChange={handleChange}
                            required
                            disabled={user?.isDefaulter}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Details */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Destination</label>
                    <input 
                        type="text" 
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="e.g. City Mall"
                        required
                        disabled={user?.isDefaulter}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Purpose</label>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows="2"
                        placeholder="e.g. Shopping"
                        required
                        disabled={user?.isDefaulter}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    ></textarea>
                </div>

                {/* Transport Radio */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-3">Mode of Transport</label>
                    <div className="flex flex-wrap gap-2">
                        {["Walk", "Auto", "Bus", "Bike", "Car"].map(mode => (
                            <label key={mode} className={`cursor-pointer px-4 py-2 rounded-full border text-xs font-medium transition ${
                                formData.transport === mode 
                                ? "bg-blue-100 text-blue-700 border-blue-500" 
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}>
                                <input 
                                    type="radio" 
                                    name="transport" 
                                    value={mode} 
                                    checked={formData.transport === mode} 
                                    onChange={handleChange} 
                                    className="sr-only" 
                                    disabled={user?.isDefaulter}
                                />
                                {mode}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-3">
                    <input type="checkbox" required id="terms" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" disabled={user?.isDefaulter} />
                    <label htmlFor="terms" className="text-sm text-slate-600">
                        I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-bold hover:underline">terms and conditions</button>
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Link to="/student/dashboard" className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 text-center transition">
                        Cancel
                    </Link>
                    <button 
                        type="submit" 
                        disabled={loading || user?.isDefaulter}
                        className={`flex-[2] text-white font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                            user?.isDefaulter 
                            ? "bg-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
                        }`}
                    >
                        {user?.isDefaulter ? <><Lock size={18} /> Locked</> : (loading ? "Submitting..." : "Submit Request")}
                    </button>
                </div>

            </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Request Submitted!</h2>
                <p className="text-slate-500 mt-2 mb-6 text-sm">Your day pass request has been processed.</p>
                <Link to="/student/dashboard" className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                    Back to Dashboard
                </Link>
            </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Terms & Conditions</h3>
                <div className="space-y-4 text-sm text-slate-500">
                    <p>1. Must return by 9:00 PM.</p>
                    <p>2. Late returns will be marked as Defaulter.</p>
                    <p>3. Do not visit restricted areas.</p>
                </div>
                <button onClick={() => setShowTerms(false)} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl">I Understand</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default StudentApplyDayPass;