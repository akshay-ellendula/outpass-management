import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Trash2, 
  Save, 
  Ban, 
  CheckCircle, 
  FileText,
  Clock 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

const WardenStudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, historyRes] = await Promise.all([
          axiosInstance.get(`/warden/students/${id}`),
          axiosInstance.get(`/warden/students/${id}/history`)
        ]);

        if (studentRes.data.success) setStudent(studentRes.data.data);
        if (historyRes.data.success) setHistory(historyRes.data.data);
      } catch (error) {
        toast.error("Failed to load student data");
        navigate("/warden/students");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Handle Input Change
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
    setIsEditing(true);
  };

  // Save Changes
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/warden/students/${id}`, student);
      if (res.data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Toggle Status
  const toggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${student.isActive ? "deactivate" : "activate"} this account?`)) return;
    try {
      const res = await axiosInstance.patch(`/warden/students/${id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        setStudent({ ...student, isActive: res.data.data.isActive });
      }
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  // Delete Student
  const handleDelete = async () => {
    if (!window.confirm("WARNING: This will permanently delete the student record. Continue?")) return;
    try {
      const res = await axiosInstance.delete(`/warden/students/${id}`);
      if (res.data.success) {
        toast.success("Student deleted");
        navigate("/warden/students");
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!student) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/warden/students" className="text-slate-400 hover:text-slate-600 transition">
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 border border-blue-200">
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {student.regNo}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                    student.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-emerald-600" : "bg-red-600"}`}></span> 
                    {student.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={toggleStatus}
                className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
                {student.isActive ? <><Ban className="w-4 h-4" /> Deactivate</> : <><CheckCircle className="w-4 h-4" /> Activate</>}
            </button>
            <button 
                onClick={handleDelete}
                className="bg-white text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Delete
            </button>
            {isEditing && (
                <button 
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Student Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                <input type="text" name="name" value={student.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Roll Number</label>
                <input type="text" value={student.regNo} disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Student Phone</label>
                <input type="text" name="phone" value={student.phone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Parent Phone</label>
                <input type="text" name="parentPhone" value={student.parentPhone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Student Email</label>
                <input type="email" name="email" value={student.email} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Parent Email</label>
                <input type="email" name="parentEmail" value={student.parentEmail} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Hostel Block</label>
                <select name="hostelBlock" value={student.hostelBlock} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="BH1">BH1</option>
                    <option value="BH2">BH2</option>
                    <option value="GH1">GH1</option>
                    <option value="GH2">GH2</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Room Number</label>
                <input type="text" name="roomNo" value={student.roomNo} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Academic Info */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Year</label>
                <select name="year" value={student.year || "1st Year"} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Branch</label>
                <input type="text" name="branch" value={student.branch || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
            </div>
        </div>
      </form>

      {/* Pass History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900">Pass Logs History</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Reason/Dest</th>
                        <th className="px-6 py-3">Date Range</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {history.length > 0 ? (
                        history.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        log.type === 'Home Pass' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">{log.destination}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="text-xs">Out: {log.outTime ? format(new Date(log.outTime), 'MMM d, h:mm a') : '-'}</div>
                                    <div className="text-xs">In: &nbsp;&nbsp;{log.inTime ? format(new Date(log.inTime), 'MMM d, h:mm a') : '-'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {log.isLate ? (
                                        <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> Late
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> {log.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No pass history found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default WardenStudentProfile;