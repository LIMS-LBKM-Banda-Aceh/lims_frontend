import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LogOut, PlusCircle, List, LayoutGrid } from "lucide-react";

import RegistrationForm from "./RegistrationsForm";
import RegistrationList from "./RegistrationList";
import RegistrationDetail from "./RegistrationDetail";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState("list");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    if (view === "list") fetchRegistrations();
  }, [view]);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get("/registrations");
      setRegistrations(res.data.data);
    } catch (error) {
      console.error("Gagal ambil data", error);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedRegistration(item);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedRegistration(null);
    setView("list");
  };

  const handleLogout = () => {
    if (confirm("Anda yakin ingin logout?")) {
      logout();
    }
  };

  return (
    // Tambahkan print:bg-white agar background abu-abu hilang saat print
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* --- FIX DISINI: Tambahkan print:hidden pada Navbar --- */}
      {/* Ini akan menghilangkan Header "LIMS Labkesmas" dan tombol "Keluar" saat print */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-400 text-white p-2 rounded-lg">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">
              LIMS Labkesmas
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              User: <span className="text-primary">{user?.username}</span> |
              Role: {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium"
        >
          <LogOut size={16} /> Keluar
        </button>
      </nav>

      {/* Tambahkan print:p-0 agar margin halaman lebih maksimal */}
      <main className="p-6 max-w-7xl mx-auto print:p-0 print:w-full print:max-w-none">
        {/* --- FIX DISINI: Tambahkan print:hidden pada Toolbar --- */}
        {view !== "detail" && (
          <div className="mb-6 flex justify-between items-center print:hidden">
            <div className="flex gap-3">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  view === "list"
                    ? "bg-primary text-white shadow-blue-200 shadow-lg"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <List size={18} /> Data Pasien
              </button>
              <button
                onClick={() => setView("create")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  view === "create"
                    ? "bg-primary text-white shadow-blue-200 shadow-lg"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <PlusCircle size={18} /> Registrasi Baru
              </button>
            </div>
          </div>
        )}

        {/* Content Switcher */}
        <div className="transition-all duration-300">
          {view === "create" && (
            <RegistrationForm onSuccess={() => setView("list")} />
          )}
          {view === "list" && (
            <RegistrationList
              data={registrations}
              onViewDetail={handleViewDetail}
              onRefresh={fetchRegistrations} // Tambahkan ini
            />
          )}
          {view === "detail" && (
            <RegistrationDetail
              data={selectedRegistration}
              onBack={handleBackToList}
            />
          )}
        </div>
      </main>
    </div>
  );
}
