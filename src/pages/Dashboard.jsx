// pages/Dashboard.jsx

import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
// --- FIX DISINI: Tambahkan PlusCircle dan List ke import ---
import {
  Menu,
  Users,
  Clock,
  CheckCircle2,
  Activity,
  Calendar,
  PlusCircle, // <--- INI PENYEBAB BLANK PUTIH (Lupa import)
  List, // <--- Tambahkan juga jaga-jaga
} from "lucide-react";

// Components
import Sidebar from "../components/Sidebar";
import RegistrationForm from "./RegistrationsForm"; // Pastikan nama file sesuai (pake 's' atau tidak)
import RegistrationList from "./RegistrationList";
import RegistrationDetail from "./RegistrationDetail";

// --- Sub-Component: StatCard ---
const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

// --- Sub-Component: Overview ---
const DashboardOverview = ({ data, onChangeView }) => {
  const total = data.length;
  const selesai = data.filter((i) => i.status === "selesai").length;
  const proses = data.filter((i) => i.status !== "selesai").length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Ringkasan Laboratorium
        </h2>
        <p className="text-gray-500">
          Update terkini aktivitas laboratorium hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Pasien"
          value={total}
          icon={Users}
          color="bg-blue-500"
          subtext="Total data registrasi masuk"
        />
        <StatCard
          title="Dalam Proses"
          value={proses}
          icon={Clock}
          color="bg-yellow-500"
          subtext="Menunggu hasil / pemeriksaan"
        />
        <StatCard
          title="Selesai"
          value={selesai}
          icon={CheckCircle2}
          color="bg-green-500"
          subtext="Hasil sudah keluar"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Activity size={20} className="text-cyan-600" /> Pasien Terbaru
          </h3>
          <button
            onClick={() => onChangeView("list")}
            className="text-sm text-cyan-600 font-medium hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        <RegistrationList
          data={data.slice(0, 5)}
          onViewDetail={(item) => onChangeView("detail", item)}
        />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations");
      // Safety check: pastikan res.data.data adalah array
      const rawData = Array.isArray(res.data.data) ? res.data.data : [];
      const sortedData = rawData.sort((a, b) => b.id - a.id);
      setRegistrations(sortedData);
    } catch (error) {
      console.error("Gagal ambil data", error);
      setRegistrations([]); // Set array kosong jika error agar tidak crash
    } finally {
      setLoading(false);
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

  const handleChangeView = (newView, item = null) => {
    if (item) setSelectedRegistration(item);
    setView(newView);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar
        currentView={view}
        setView={setView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 md:ml-64 transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex justify-between items-center border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {view === "overview"
                  ? "Dashboard Overview"
                  : view === "list"
                  ? "Data Pasien"
                  : view === "create"
                  ? "Registrasi Baru"
                  : view === "detail"
                  ? "Detail Pasien"
                  : view}
              </h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} />{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold text-gray-700">
                Halo, {user?.username}
              </span>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 min-h-[calc(100vh-80px)] print:p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
              <div className="w-6 h-6 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
              Memuat data...
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {view === "overview" && (
                <DashboardOverview
                  data={registrations}
                  onChangeView={handleChangeView}
                />
              )}

              {view === "create" && (
                <RegistrationForm
                  onSuccess={() => {
                    fetchRegistrations();
                    setView("list");
                  }}
                />
              )}

              {view === "list" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Data Pasien
                      </h2>
                      <p className="text-gray-500">
                        Kelola seluruh data registrasi laboratorium.
                      </p>
                    </div>
                    {/* Component PlusCircle ini yang bikin crash sebelumnya */}
                    <button
                      onClick={() => setView("create")}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                      <PlusCircle size={18} /> Tambah Baru
                    </button>
                  </div>
                  <RegistrationList
                    data={registrations}
                    onViewDetail={handleViewDetail}
                    onRefresh={fetchRegistrations}
                  />
                </div>
              )}

              {view === "detail" && (
                <RegistrationDetail
                  data={selectedRegistration}
                  onBack={handleBackToList}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
