import React, { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner"; 
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  QrCode,
  X,
  Zap
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const SecurityScanPage = () => {
  const [mode, setMode] = useState('CHECK_OUT');
  const [stats, setStats] = useState({ totalScanned: 0, currentlyOut: 0, alerts: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  
  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  
  // Result Modal State
  const [scanResult, setScanResult] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false); 

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      const res = await axiosInstance.get("/gate/dashboard");
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentLogs(res.data.data.recentLogs);
      }
    } catch (error) {
      console.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // --- QR SCANNER HANDLER (FIXED) ---
  const handleScan = async (detectedCodes) => {
    // Only proceed if codes detected and not currently verifying
    if (detectedCodes && detectedCodes.length > 0 && !verifying) {
      const rawValue = detectedCodes[0].rawValue;
      
      // 1. Immediately lock scanning
      setIsScanning(false); 
      setVerifying(true); 
      
      try {
        let passId = rawValue;
        
        console.log("🔍 Scanned Raw Data:", rawValue);
        
        // 2. Smart JSON Parsing
        // We MUST extract 'id' (The Pass MongoID), NOT 'regNo' (Student ID)
        try {
            const parsed = JSON.parse(rawValue);
            if (parsed.id) {
                passId = parsed.id;
            } else if (parsed._id) {
                passId = parsed._id;
            }
        } catch (e) {
            // Not JSON, treat as raw string (Pass ID)
        }

        // 3. Strict Validation: Must be a 24-char Hex String (MongoID)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(passId);

        if (!passId || !isMongoId) {
            throw new Error("Invalid QR Format. Expecting Pass ID.");
        }

        // 4. Call API with the Cleaned Pass ID
        await verifyStudent(passId);

      } catch (err) {
        console.error("Scan Logic Error:", err);
        toast.error("Invalid QR Code. Please scan a valid Pass.");
        setVerifying(false); // Unlock to allow retry
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
    toast.error("Camera error. Check permissions.");
    setIsScanning(false);
  };

  // --- API VERIFICATION ---
  const verifyStudent = async (passId) => {
    try {
      // Backend expects 'regNo' field, but we send the Pass ID in it
      const res = await axiosInstance.post("/gate/verify", {
        regNo: passId, 
        scanType: mode
      });

      setScanResult({ success: true, ...res.data });
      setIsModalOpen(true); 
      fetchDashboard(); 

    } catch (error) {
      setScanResult({ 
        success: false, 
        message: error.response?.data?.message || "Verification Failed",
        student: error.response?.data?.student
      });
      setIsModalOpen(true);
    } finally {
      setVerifying(false);
    }
  };

  const closeResultModal = () => {
    setIsModalOpen(false);
    setScanResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full relative">
      
      {/* Left Column: Stats & Actions */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Scanned</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalScanned}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Out Now</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.currentlyOut}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Alerts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.alerts}</p>
          </div>
        </div>

        {/* Main Action Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          
          {/* Mode Toggle */}
          <div className="bg-slate-50 p-1 rounded-lg mb-8 w-72 border border-slate-100 flex shadow-sm">
            <button 
              onClick={() => setMode('CHECK_OUT')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-bold transition ${mode === 'CHECK_OUT' ? 'bg-white text-blue-700 shadow border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Check OUT
            </button>
            <button 
              onClick={() => setMode('CHECK_IN')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-bold transition ${mode === 'CHECK_IN' ? 'bg-white text-blue-700 shadow border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Check IN
            </button>
          </div>

          {/* Big Scan Button */}
          <button 
            onClick={() => setIsScanning(true)}
            className="group relative w-64 h-64 rounded-full bg-slate-900 text-white shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-600 animate-[spin_10s_linear_infinite]"></div>
            <QrCode className="w-20 h-20 mb-4 text-blue-400 group-hover:text-white transition-colors" />
            <span className="text-xl font-bold">Start Scanner</span>
            <span className="text-xs text-slate-400 mt-1 font-mono">{mode.replace('_', ' ')} MODE</span>
          </button>

          <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Zap className="w-4 h-4" /> Ready to scan
          </div>
        </div>
      </div>

      {/* Right Column: Recent Feed */}
      <div className="lg:col-span-5 h-full">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden max-h-[calc(100vh-8rem)]">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-red-500">LIVE</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
            {recentLogs.map((log) => (
              <div key={log._id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  log.scanType === 'CHECK_OUT' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  log.scanType === 'CHECK_IN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                   {log.scanType === 'CHECK_OUT' ? <ArrowRight className="w-5 h-5" /> : 
                     log.scanType === 'CHECK_IN' ? <ArrowLeft className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-bold text-sm text-slate-900">{log.studentId?.name || "Unknown"}</p>
                    <span className="text-xs font-mono text-slate-400">{format(new Date(log.timestamp), "h:mm a")}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{log.studentId?.regNo}</p>
                  <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.comment === 'Late Entry' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {log.scanType.replace('_', ' ')} {log.comment && log.comment !== 'Standard' && `- ${log.comment}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CAMERA OVERLAY --- */}
      {isScanning && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <div className="relative w-full h-full max-w-lg aspect-[9/16] bg-black">
            
            <Scanner
              onScan={handleScan}
              onError={handleError}
              formats={['qr_code']} 
              components={{
                audio: false, 
                onOff: true, 
                finder: false 
              }}
              styles={{
                container: { height: '100%', width: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
            
            {/* Custom UI Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className="w-64 h-64 border-2 border-red-500 relative shadow-[0_0_50px_rgba(239,68,68,0.5)] z-10 rounded-lg">
                 <div className="absolute w-full h-1 bg-red-500 top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#ef4444]"></div>
                 
                 <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                 <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                 <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
                 <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>
               </div>
            </div>

            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-8 right-8 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition z-50 pointer-events-auto"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none z-50">
              <p className="text-white font-bold text-lg drop-shadow-md">Align QR Code within frame</p>
              <p className="text-white/70 text-sm mt-1">Scanning automatically...</p>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {isModalOpen && scanResult && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 ring-1 ring-white/20">
            
            {/* Status Header */}
            <div className={`p-8 text-center ${scanResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm ${
                  scanResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {scanResult.success ? <CheckCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
              </div>
              <h3 className={`text-2xl font-black ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {scanResult.success ? "ACCESS GRANTED" : "ACCESS DENIED"}
              </h3>
              <p className="text-slate-600 font-medium mt-1">{scanResult.message}</p>
            </div>
            
            {/* Details Body */}
            <div className="p-6">
              <div className="space-y-4 mb-8">
                {/* Student Info */}
                {(scanResult.data?.studentName || scanResult.student?.name) && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-bold text-xs uppercase">Student</span>
                        <div className="text-right">
                            <span className="block font-bold text-slate-900 text-lg leading-tight">
                                {scanResult.data?.studentName || scanResult.student?.name}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                                {scanResult.data?.regNo || scanResult.student?.regNo}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Info */}
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-bold text-xs uppercase">Action</span>
                    <span className="font-bold text-blue-700">{mode.replace('_', ' ')}</span>
                </div>

                {/* Alerts */}
                {scanResult.data?.isLate && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-red-500 font-bold text-xs uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Alert
                        </span>
                        <span className="font-bold text-red-600">LATE ENTRY MARKED</span>
                    </div>
                )}
              </div>

              <button 
                onClick={closeResultModal} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                Confirm & Next
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SecurityScanPage;