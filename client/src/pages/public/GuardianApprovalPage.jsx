import React, { useEffect, useState } from "react";
import { useParams } from "react-router"; // react-router-dom v6
import { CheckCircle, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { format } from "date-fns";

const GuardianApprovalPage = () => {
  const { token } = useParams();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState(null); // 'success' | 'rejected' | null

  // Fetch Pass Details
  useEffect(() => {
    const fetchPass = async () => {
      try {
        const res = await axiosInstance.get(`/student/public/pass/${token}`);
        if (res.data.success) {
          setPassData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or Expired Link");
      } finally {
        setLoading(false);
      }
    };
    fetchPass();
  }, [token]);

  // Handle Action
  const handleAction = async (action) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(`/student/public/pass/${token}/action`, { action });
      if (res.data.success) {
        setActionStatus(action === 'APPROVE' ? 'success' : 'rejected');
      }
    } catch (err) {
      alert("Action Failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link Expired or Invalid</h2>
          <p className="text-slate-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Success State (After Action)
  if (actionStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            actionStatus === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {actionStatus === 'success' ? (
                <CheckCircle className="text-green-600 w-8 h-8" />
            ) : (
                <XCircle className="text-red-600 w-8 h-8" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {actionStatus === 'success' ? 'Approved Successfully' : 'Request Rejected'}
          </h2>
          <p className="text-slate-500 mt-2">
            Thank you for your response. You can close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-6 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-white text-xl font-bold">Home Pass Request</h1>
          <p className="text-blue-100 text-sm mt-1">Approval Required</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-slate-500 text-sm">Your ward,</p>
            <h2 className="text-2xl font-bold text-slate-900">{passData.studentId.name}</h2>
            <p className="text-sm font-mono text-slate-400 mt-1">{passData.studentId.regNo}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 mb-8">
            <div className="flex justify-between">
                <span className="text-sm text-slate-500">Leaving:</span>
                <span className="text-sm font-bold text-slate-900">
                    {format(new Date(passData.fromDate), "MMM d, yyyy - h:mm a")}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm text-slate-500">Returning:</span>
                <span className="text-sm font-bold text-slate-900">
                    {format(new Date(passData.toDate), "MMM d, yyyy - h:mm a")}
                </span>
            </div>
            <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Reason</p>
                <p className="text-sm text-slate-800">{passData.reason}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => handleAction('REJECT')}
                className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition"
            >
                Reject
            </button>
            <button 
                onClick={() => handleAction('APPROVE')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
                Approve Request
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuardianApprovalPage;