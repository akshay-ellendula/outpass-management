import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, House, Info, CheckCircle, X, Lock } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const StudentApplyHomePass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    destination: "",
    reason: "",
    transport: "Bus"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (new Date(formData.toDate) < new Date(formData.fromDate)) {
        toast.error("Return date cannot be before leaving date");
        return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/student/apply/home", formData);
      if (res.data.success) {
        setShowPreview(false);
        setShowSuccess(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit");
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/student/dashboard" className="bg-blue-600 p-2 rounded-lg text-white">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Apply Home Pass</h1>
      </div>

      {/* Defaulter Banner */}
      {user?.isDefaulter && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3">
            {/* <Warning className="textl-red-500 w-6 h-6" /> */}
            <p className="text-sm text-red-700 font-medium">Action Blocked: You are a Defaulter.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-8 border-b border-slate-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <House className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Home Pass Application</h2>
            <p className="text-slate-500 mt-2 text-sm">Requires Guardian Email Approval.</p>
        </div>

        <div className="p-6">
            <form onSubmit={handlePreview} className="space-y-6">
                
                {/* Dates */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Leaving On</label>
                        <div className="grid grid-cols-5 gap-2">
                            <input type="date" name="fromDate" required onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="col-span-3 w-full border rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="time" name="fromTime" required onChange={handleChange} className="col-span-2 w-full border rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Returning On</label>
                        <div className="grid grid-cols-5 gap-2">
                            <input type="date" name="toDate" required onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="col-span-3 w-full border rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <input type="time" name="toTime" required onChange={handleChange} className="col-span-2 w-full border rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Destination</label>
                    <input type="text" name="destination" required onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City / Address" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Reason</label>
                    <textarea name="reason" required onChange={handleChange} rows="2" className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Reason for leave"></textarea>
                </div>

                {/* Workflow Info */}
                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                    <Info className="text-blue-600 w-5 h-5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                        <strong>Workflow:</strong> 1. Guardian Email Approval &rarr; 2. Warden Approval &rarr; 3. Security Scan.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <button 
                        type="submit" 
                        disabled={user?.isDefaulter}
                        className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg ${user?.isDefaulter ? 'bg-slate-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    >
                       {user?.isDefaulter ? <><Lock className="inline w-4 h-4 mr-2" /> Locked</> : "Proceed to Preview"}
                    </button>
                </div>
            </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold">Review Application</h3>
                    <button onClick={() => setShowPreview(false)}><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-slate-500">From</span> <span className="font-bold">{formData.fromDate} {formData.fromTime}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">To</span> <span className="font-bold">{formData.toDate} {formData.toTime}</span></div>
                    </div>
                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                        {loading ? "Submitting..." : "Confirm & Submit"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Request Sent!</h2>
                <p className="text-slate-500 mt-2 mb-6 text-sm">Approval link sent to Guardian.</p>
                <Link to="/student/dashboard" className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
                    Back to Dashboard
                </Link>
            </div>
        </div>
      )}

    </div>
  );
};

export default StudentApplyHomePass;