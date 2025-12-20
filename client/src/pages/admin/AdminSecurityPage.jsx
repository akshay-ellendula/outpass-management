import React, { useEffect, useState } from "react";
import { Search, Shield, MapPin, Clock, Plus, Eye } from "lucide-react"; // Added Eye icon
import { Link } from "react-router"; // or 'react-router-dom'
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const AdminSecurityPage = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Guards from API
  useEffect(() => {
    const fetchGuards = async () => {
      try {
        const res = await axiosInstance.get("/admin/guards");
        if (res.data.success) {
          setGuards(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching guards:", error);
        toast.error("Failed to load security guards");
      } finally {
        setLoading(false);
      }
    };

    fetchGuards();
  }, []);

  // Filter Logic
  const filteredGuards = guards.filter(
    (guard) =>
      guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.guardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.gateLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search guard..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        
        {/* Add Guard Button */}
        <Link
          to="/admin/guards/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Guard
        </Link>
      </div>

      {/* Guards Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Guard ID</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Shift</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th> {/* Added Header */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Loading guards...
                  </td>
                </tr>
              ) : filteredGuards.length > 0 ? (
                filteredGuards.map((guard) => (
                  <tr key={guard._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {guard.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {guard.guardId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {guard.gateLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {guard.shift}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          guard.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {guard.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {/* Added Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/guards/${guard._id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No guards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminSecurityPage;