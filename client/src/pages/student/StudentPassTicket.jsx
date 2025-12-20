import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Archive, 
  Lock, 
  MapPin, 
  Download, 
  Calendar 
} from "lucide-react"; // Only Lucide icons
import { axiosInstance } from "../../lib/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";

const StudentPassTicket = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // 'Day Pass' or 'Home Pass'

  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const res = await axiosInstance.get(`/student/pass/${id}?type=${type}`);
        if (res.data.success) {
          setPass(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load pass details");
      } finally {
        setLoading(false);
      }
    };
    fetchPass();
  }, [id, type]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Ticket...</div>;
  if (!pass) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Pass not found</div>;

  // --- Configuration Logic ---

  // 1. Determine Status Config
  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-600',
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Approved',
          showQR: true,
          scanLine: true
        };
      case 'PENDING':
      case 'PENDING_GUARDIAN':
      case 'PENDING_WARDEN':
        return {
          bg: 'bg-amber-500',
          icon: <Clock className="w-6 h-6" />,
          text: 'Pending Approval',
          showQR: false,
          locked: true
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          bg: 'bg-red-600',
          icon: <XCircle className="w-6 h-6" />,
          text: status === 'CANCELLED' ? 'Cancelled' : 'Rejected',
          showQR: false,
          rejected: true
        };
      case 'COMPLETED':
      case 'EXPIRED':
        return {
          bg: 'bg-slate-500',
          icon: <Archive className="w-6 h-6" />,
          text: 'Pass Used / Expired',
          showQR: false,
          used: true
        };
      default:
        return { bg: 'bg-slate-500', text: status, showQR: false };
    }
  };

  const statusConfig = getStatusConfig(pass.status);
  const isDayPass = type === 'Day Pass';

  // 2. Format Dates/Times
  const dateStr = isDayPass 
    ? format(new Date(pass.date), "MMM d, yyyy") 
    : null; // For Home pass we use ranges

  const outLabel = isDayPass ? "Out Time" : "Leaving On";
  const outValue = isDayPass 
    ? format(new Date(pass.expectedOut), "h:mm a") 
    : format(new Date(pass.fromDate), "MMM d, h:mm a");

  const inLabel = isDayPass ? "In Time" : "Returning On";
  const inValue = isDayPass 
    ? format(new Date(pass.expectedIn), "h:mm a") 
    : format(new Date(pass.toDate), "MMM d, h:mm a");

  // 3. QR Data
  const qrData = JSON.stringify({
    id: pass._id,
    type: type,
    regNo: pass.studentId.regNo,
    qrCode: pass.qrCode
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/student/dashboard" className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 transition text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg text-slate-800">{type} Ticket</span>
        </div>
      </nav>

      {/* Main Ticket Area */}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-md">

        {/* Status Banner */}
        <div className={`mb-6 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center transition-colors duration-300 ${statusConfig.bg}`}>
          <div>
            <p className="text-xs font-medium opacity-90 uppercase tracking-wider mb-1">Current Status</p>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {statusConfig.icon} {statusConfig.text}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Pass ID</p>
            <p className="font-mono font-bold text-sm md:text-lg">#{pass._id.toString().slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* The Ticket */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mb-6">
          
          {/* Top Section: QR & User */}
          <div className="p-8 flex flex-col items-center justify-center bg-white relative border-b-2 border-dashed border-slate-200">
            
            <div className="relative w-48 h-48 bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center justify-center mb-4 overflow-hidden group">
              
              {/* Active QR */}
              {statusConfig.showQR && (
                <div className="flex flex-col items-center relative w-full h-full justify-center">
                  <img src={qrUrl} alt="Gate Pass QR" className="w-40 h-40 object-contain mix-blend-multiply opacity-90" />
                  {/* Scan Animation Line */}
                  <div className="absolute w-full h-1 bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.6)] top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              )}

              {/* Locked State */}
              {statusConfig.locked && (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                  <Lock className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wide">QR Locked</span>
                </div>
              )}

              {/* Rejected State */}
              {statusConfig.rejected && (
                <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center text-red-400">
                  <XCircle className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wide">Invalid</span>
                </div>
              )}

              {/* Used State */}
              {statusConfig.used && (
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-500">
                  <CheckCircle className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wide">Already Scanned</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-slate-900 font-bold text-lg tracking-tight">{pass.studentId.name}</p>
              <p className="text-slate-500 text-xs font-mono">{pass.studentId.regNo}</p>
            </div>

            {/* CSS Scallops */}
            <div className="absolute h-5 w-5 bg-slate-50 rounded-full -bottom-[10px] -left-[10px] border-t border-r border-slate-200"></div>
            <div className="absolute h-5 w-5 bg-slate-50 rounded-full -bottom-[10px] -right-[10px] border-t border-l border-slate-200"></div>
          </div>

          {/* Bottom Section: Details */}
          <div className="p-6 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">{outLabel}</p>
                <p className="text-slate-900 font-bold text-sm md:text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> {outValue}
                </p>
                {isDayPass && <p className="text-[10px] text-slate-400">{dateStr}</p>}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">{inLabel}</p>
                <p className="text-slate-900 font-bold text-sm md:text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> {inValue}
                </p>
                {isDayPass && <p className="text-[10px] text-slate-400">{dateStr}</p>}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Destination</p>
              <p className="text-slate-900 font-medium text-sm flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                {pass.reason} 
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {statusConfig.showQR ? (
                <button 
                  onClick={() => alert("Ticket Download Logic Here")} 
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Ticket
                </button>
              ) : (
                <button className="w-full bg-slate-200 text-slate-400 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed">
                  Action Unavailable
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Activity Log (Visible mostly for Day Passes or if we track Home Pass steps) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Activity Log</h3>
          
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
            
            {/* Created Step */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
              <p className="text-xs text-slate-500 mb-0.5">{format(new Date(pass.createdAt), "h:mm a · MMM d")}</p>
              <p className="text-sm font-bold text-slate-900">Request Submitted</p>
            </div>

            {/* Approval Step */}
            {['APPROVED', 'COMPLETED', 'REJECTED'].includes(pass.status) && (
               <div className="relative">
                 <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${pass.status === 'REJECTED' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                 <p className="text-xs text-slate-500 mb-0.5">{format(new Date(pass.updatedAt), "h:mm a · MMM d")}</p>
                 <p className="text-sm font-bold text-slate-900">
                    {pass.status === 'REJECTED' ? 'Request Rejected' : 'Warden Approved'}
                 </p>
                 {pass.rejectionReason && <p className="text-xs text-red-500 mt-1">Reason: {pass.rejectionReason}</p>}
               </div>
            )}

            {/* Gate Steps (Mocked Logic based on actual times) */}
            {pass.actualOutTime && (
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                    <p className="text-xs text-slate-500 mb-0.5">{format(new Date(pass.actualOutTime), "h:mm a · MMM d")}</p>
                    <p className="text-sm font-bold text-slate-900">Exited Campus</p>
                </div>
            )}

            {pass.actualInTime && (
                <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                    <p className="text-xs text-slate-500 mb-0.5">{format(new Date(pass.actualInTime), "h:mm a · MMM d")}</p>
                    <p className="text-sm font-bold text-slate-900">Returned to Campus</p>
                </div>
            )}

          </div>
        </div>

      </main>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StudentPassTicket;