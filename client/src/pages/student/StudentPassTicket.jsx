import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router"; // Ensure react-router-dom
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Archive, 
  Lock, 
  MapPin, 
  Download, 
  Calendar,
  UserCheck,
  ShieldCheck
} from "lucide-react"; 
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

  // --- Configuration Logic ---

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { bg: 'bg-emerald-600', icon: <CheckCircle className="w-6 h-6" />, text: 'Approved', showQR: true, scanLine: true };
      
      case 'PENDING':
        return { bg: 'bg-amber-500', icon: <Clock className="w-6 h-6" />, text: 'Pending Approval', showQR: false, locked: true };
      
      case 'PENDING_GUARDIAN':
        return { bg: 'bg-purple-600', icon: <UserCheck className="w-6 h-6" />, text: 'Waiting for Guardian', showQR: false, locked: true };
      
      case 'PENDING_WARDEN':
        return { bg: 'bg-blue-600', icon: <ShieldCheck className="w-6 h-6" />, text: 'Waiting for Warden', showQR: false, locked: true };
      
      case 'REJECTED':
      case 'CANCELLED':
        return { bg: 'bg-red-600', icon: <XCircle className="w-6 h-6" />, text: status === 'CANCELLED' ? 'Cancelled' : 'Rejected', showQR: false, rejected: true };
      
      case 'COMPLETED':
      case 'EXPIRED':
        return { bg: 'bg-slate-500', icon: <Archive className="w-6 h-6" />, text: 'Pass Used / Expired', showQR: false, used: true };
      
      // ✅ FIX: Changed 'OUT' to 'CURRENTLY_OUT' to match your backend data
      case 'CURRENTLY_OUT': 
      case 'OUT': // Keeping this as a fallback just in case
        return { 
            bg: 'bg-blue-600', 
            icon: <Clock className="w-6 h-6" />, 
            text: 'Currently Out', 
            showQR: true, // This ensures the QR code is visible
            scanLine: true 
        };
        
      default:
        return { bg: 'bg-slate-500', text: status, showQR: false };
    }
  };

  const statusConfig = getStatusConfig(pass.status);
  const isDayPass = type === 'Day Pass';

  const dateStr = isDayPass ? format(new Date(pass.date), "MMM d, yyyy") : null; 
  const outLabel = isDayPass ? "Out Time" : "Leaving On";
  const outValue = isDayPass ? format(new Date(pass.expectedOut), "h:mm a") : format(new Date(pass.fromDate), "MMM d, h:mm a");
  const inLabel = isDayPass ? "In Time" : "Returning On";
  const inValue = isDayPass ? format(new Date(pass.expectedIn), "h:mm a") : format(new Date(pass.toDate), "MMM d, h:mm a");

  const qrData = JSON.stringify({ id: pass._id, type: type, regNo: pass.studentId.regNo, qrCode: pass.qrCode });
  // Increased size request to API for sharper image
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
      {/* Main Container - Responsive Width */}
      <main className="flex-grow container mx-auto px-4 py-6 w-full lg:max-w-7xl">
        
        {/* Large Screen Layout: Grid 75% - 25% */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column (Ticket) - 75% */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Status Banner */}
            <div className={`rounded-2xl p-6 text-white shadow-lg flex justify-between items-center transition-colors duration-300 ${statusConfig.bg}`}>
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

            {/* The Ticket (Responsive Flex) */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col lg:flex-row">
              
              {/* QR Section (Top on mobile, Left on Desktop) */}
              <div className="relative p-8 flex flex-col items-center justify-center bg-white lg:w-5/12 border-b-2 lg:border-b-0 lg:border-r-2 border-dashed border-slate-200">
                
                {/* INCREASED SIZE: w-72 h-72 (288px) */}
                <div className="relative w-72 h-72 bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center justify-center mb-6 overflow-hidden group shadow-inner">
                  {statusConfig.showQR && (
                    <div className="flex flex-col items-center relative w-full h-full justify-center">
                      {/* INCREASED IMAGE SIZE: w-64 h-64 */}
                      <img src={qrUrl} alt="Gate Pass QR" className="w-64 h-64 object-contain mix-blend-multiply opacity-90" />
                      <div className="absolute w-full h-1.5 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.6)] top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  )}
                  {statusConfig.locked && (
                    <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <Lock className="w-16 h-16 mb-3" />
                      <span className="text-sm font-bold uppercase tracking-wide">QR Locked</span>
                    </div>
                  )}
                  {statusConfig.rejected && (
                    <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center text-red-400">
                      <XCircle className="w-16 h-16 mb-3" />
                      <span className="text-sm font-bold uppercase tracking-wide">Invalid</span>
                    </div>
                  )}
                  {statusConfig.used && (
                    <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-500">
                      <CheckCircle className="w-16 h-16 mb-3" />
                      <span className="text-sm font-bold uppercase tracking-wide">Already Scanned</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-slate-900 font-bold text-xl tracking-tight">{pass.studentId.name}</p>
                  <p className="text-slate-500 text-sm font-mono mt-1">{pass.studentId.regNo}</p>
                </div>

                {/* CSS Scallops (Responsive Positioning) */}
                {/* Mobile: Bottom Left/Right */}
                <div className="lg:hidden absolute h-6 w-6 bg-slate-50 rounded-full -bottom-[12px] -left-[12px] border-t border-r border-slate-200"></div>
                <div className="lg:hidden absolute h-6 w-6 bg-slate-50 rounded-full -bottom-[12px] -right-[12px] border-t border-l border-slate-200"></div>
                
                {/* Desktop: Top/Bottom Right of this section (which acts as the divider) */}
                <div className="hidden lg:block absolute h-6 w-6 bg-slate-50 rounded-full -top-[12px] -right-[12px] border-b border-l border-slate-200"></div>
                <div className="hidden lg:block absolute h-6 w-6 bg-slate-50 rounded-full -bottom-[12px] -right-[12px] border-t border-l border-slate-200"></div>
              </div>

              {/* Details Section (Bottom on mobile, Right on Desktop) */}
              <div className="p-8 bg-slate-50/50 flex flex-col justify-center lg:w-7/12">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2 tracking-wide">{outLabel}</p>
                    <p className="text-slate-900 font-bold text-lg md:text-2xl flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> {outValue}
                    </p>
                    {isDayPass && <p className="text-xs font-medium text-slate-400 mt-1">{dateStr}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2 tracking-wide">{inLabel}</p>
                    <p className="text-slate-900 font-bold text-lg md:text-2xl flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> {inValue}
                    </p>
                    {isDayPass && <p className="text-xs font-medium text-slate-400 mt-1">{dateStr}</p>}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-2 tracking-wide">Destination</p>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-900 font-medium text-base flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      {pass.reason} 
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {statusConfig.showQR ? (
                    <button 
                      onClick={() => alert("Ticket Download Logic Here")} 
                      className="flex-1 bg-white border border-slate-300 text-slate-700 py-3.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Download Ticket
                    </button>
                  ) : (
                    <button className="w-full bg-slate-200 text-slate-400 py-3.5 rounded-xl text-sm font-bold cursor-not-allowed">
                      Action Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Activity Log) - 25% */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Activity Log
              </h3>
              
              <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                {/* Created */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <p className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold">{format(new Date(pass.createdAt), "MMM d, h:mm a")}</p>
                  <p className="text-xs font-bold text-slate-900">Request Submitted</p>
                </div>

                {/* Approvals */}
                {!isDayPass && (
                   <div className="relative">
                     <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${pass.isGuardianApproved ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                     <p className="text-[10px] text-slate-500 mb-0.5 font-bold">{pass.isGuardianApproved ? "Approved" : "Pending"}</p>
                     <p className="text-xs font-bold text-slate-900">Guardian Status</p>
                   </div>
                )}

                {['APPROVED', 'COMPLETED', 'REJECTED'].includes(pass.status) && (
                   <div className="relative">
                     <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${pass.status === 'REJECTED' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                     <p className="text-[10px] text-slate-500 mb-0.5 font-bold">{format(new Date(pass.updatedAt), "MMM d, h:mm a")}</p>
                     <p className="text-xs font-bold text-slate-900">
                        {pass.status === 'REJECTED' ? 'Request Rejected' : 'Warden Approved'}
                     </p>
                     {pass.rejectionReason && <p className="text-[10px] text-red-500 mt-1 italic">"{pass.rejectionReason}"</p>}
                   </div>
                )}

                {/* Gates */}
                {pass.actualOutTime && (
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                        <p className="text-[10px] text-slate-500 mb-0.5 font-bold">{format(new Date(pass.actualOutTime), "MMM d, h:mm a")}</p>
                        <p className="text-xs font-bold text-slate-900">Exited Campus</p>
                    </div>
                )}

                {pass.actualInTime && (
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                        <p className="text-[10px] text-slate-500 mb-0.5 font-bold">{format(new Date(pass.actualInTime), "MMM d, h:mm a")}</p>
                        <p className="text-xs font-bold text-slate-900">Returned</p>
                    </div>
                )}
              </div>
            </div>
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