import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Phone, Mail } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const AdminStudentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHostel, setFilterHostel] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  

  // Fetch Students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/students");
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHostel = filterHostel === "All" || student.hostelBlock === filterHostel;
    
    const matchesStatus = filterStatus === "All" 
      ? true 
      : filterStatus === "Active" 
        ? student.isActive && !student.isDefaulter 
        : student.isDefaulter; // Assuming "Defaulter" is the other option

    return matchesSearch && matchesHostel && matchesStatus;
  });

  // Helper for Initials
  const getInitials = (name) => name.substring(0, 2).toUpperCase();

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Roll No or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
          
          {/* Filters */}
          <select 
            value={filterHostel}
            onChange={(e) => setFilterHostel(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-600 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="All">All Hostels</option>
            <option value="BH1">Boys Hostel 1</option>
            <option value="BH2">Boys Hostel 2</option>
            <option value="GH1">Girls Hostel 1</option>
            <option value="GH2">Girls Hostel 2</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-600 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Defaulters">Defaulters</option>
          </select>
        </div>

        
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student Details</th>
                <th className="px-6 py-4">Hostel Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading students...</td></tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.regNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-medium">{student.hostelBlock}</p>
                      <p className="text-xs text-slate-500">Room {student.roomNo}</p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="flex items-center gap-1"><Phone className="text-slate-400" /> {student.phone}</p>
                      <p className="flex items-center gap-1"><Mail className="text-slate-400" /> {student.email}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {student.isDefaulter ? (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                          Defaulter
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No students found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
    </>
  );
};

export default AdminStudentPage;