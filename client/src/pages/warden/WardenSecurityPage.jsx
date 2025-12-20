import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, MapPin, User, Trash2 } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const WardenSecurityPage = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuards = async () => {
      try {
        const res = await axiosInstance.get("/warden/guards");
        if (res.data.success) setGuards(res.data.data);
      } catch (error) {
        toast.error("Failed to load guards");
      } finally {
        setLoading(false);
      }
    };
    fetchGuards();
  }, []);

  const handleDelete = async (id) => {
      if(!confirm("Are you sure you want to remove this guard?")) return;
      try {
          await axiosInstance.delete(`/warden/guards/${id}`);
          setGuards(prev => prev.filter(g => g._id !== id));
          toast.success("Guard removed");
      } catch (error) {
          toast.error("Failed to remove guard");
      }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 text-lg">Active Guards</h3>
        <Link
          to="/warden/security/add"
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Guard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guards.map((guard) => (
            <div key={guard._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition relative overflow-hidden group">
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    guard.isActive 
                    ? "bg-green-50 text-green-700 border-green-100" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${guard.isActive ? "bg-green-600 animate-pulse" : "bg-slate-400"}`}></span> 
                  {guard.isActive ? "Active" : "Disabled"}
                </span>
              </div>

              <div className="w-16 h-16 rounded-full bg-slate-100 mb-3 flex items-center justify-center text-2xl border border-slate-200 mt-2">
                👮‍♂️
              </div>
              <h4 className="font-bold text-slate-900">{guard.name}</h4>
              <p className="text-xs text-slate-500 mb-4 font-mono">ID: {guard.guardId}</p>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-600 mb-4">
                <MapPin className="w-3 h-3 text-slate-400" /> {guard.gateLocation}
              </div>

              <div className="w-full flex gap-2 mt-auto">
                <Link
                  to={`/warden/security/${guard._id}`}
                  className="flex-1 border border-blue-200 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition flex items-center justify-center gap-1"
                >
                  View Profile
                </Link>
                <button 
                    onClick={() => handleDelete(guard._id)}
                    className="flex-1 bg-white text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 py-2 rounded-lg text-xs font-bold transition"
                >
                    Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default WardenSecurityPage;