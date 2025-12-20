import React, { useEffect, useState } from "react";
import { Link } from "react-router"; // or 'react-router-dom'
import { Search, Plus, Eye, MoreHorizontal } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const AdminWardenPage = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchWardens = async () => {
      try {
        const res = await axiosInstance.get("/admin/wardens");
        if (res.data.success) {
          setWardens(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load wardens");
      } finally {
        setLoading(false);
      }
    };
    fetchWardens();
  }, []);

  const filteredWardens = wardens.filter(
    (warden) =>
      warden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warden.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search warden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <Link
          to="/admin/wardens/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Warden
        </Link>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Warden Name</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Assigned Block</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
              ) : filteredWardens.length > 0 ? (
                filteredWardens.map((warden) => (
                  <tr key={warden._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {warden.name.substring(0, 2).toUpperCase()}
                      </div>
                      {warden.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{warden.empId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{warden.email}</span>
                        <span className="text-xs text-slate-400">{warden.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200">
                        {warden.assignedBlock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                        warden.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${warden.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {warden.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/wardens/${warden._id}`} 
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No wardens found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminWardenPage;