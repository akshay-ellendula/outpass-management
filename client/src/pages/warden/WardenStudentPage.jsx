import React, { useEffect, useState } from "react";
import { Link } from "react-router"; // Use 'react-router-dom' if v6
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  User 
} from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const WardenStudentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hostelBlock, setHostelBlock] = useState(""); // To display current block

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axiosInstance.get("/warden/students");
        if (res.data.success) {
          setStudents(res.data.data);
          setHostelBlock(res.data.block);
        }
      } catch (error) {
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter Logic
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        
        <Link
          to="/warden/students/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">
                All Students
                <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    {filteredStudents.length} Total
                </span>
            </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.regNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Room {student.roomNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {student.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.isDefaulter ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Defaulter
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/warden/students/${student._id}`} 
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded transition"
                      >
                        <User className="w-3.5 h-3.5" /> View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default WardenStudentPage;