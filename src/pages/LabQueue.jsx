// pages/LabQueue.jsx

import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  PlayCircle,
  Package,
  FileEdit,
  AlertCircle,
  Search, 
  RefreshCw, 
  ArrowRight, 
} from "lucide-react";
import ResultInputModal from "../components/ResultInputModal";

export default function LabQueue({ onRefreshStats }) {
  const [activeTab, setActiveTab] = useState("waiting"); // 'waiting' (Diterima Lab) or 'process' (Proses Lab)
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State baru untuk pencarian
  const [selectedSample, setSelectedSample] = useState(null);
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations/lab-queue");
      if (res.data.success) {
        setQueue(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat antrian lab");
    } finally {
      // Sedikit delay agar animasi loading/refresh terasa lebih natural
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // --- LOGIKA FILTER & SEARCH (Updated using useMemo) ---
  const filteredData = useMemo(() => {
    return queue.filter((item) => {
      // 1. Filter by Tab 
      let matchesTab = false;
      if (activeTab === "waiting") matchesTab = item.status === "diterima_lab";
      if (activeTab === "process") matchesTab = item.status === "proses_lab";

      // 2. Filter by Search Query
      const query = searchQuery.toLowerCase();
      // Melakukan pencarian di No Sampel, No Reg, atau Nama Pasien (jika ada di data)
      const matchesSearch =
        (item.no_sampel_lab || "").toLowerCase().includes(query) ||
        (item.no_reg || "").toLowerCase().includes(query) ||
        (item.nama_pasien || "").toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [queue, activeTab, searchQuery]);

  const handleStartProcess = async (id, noSampel) => {
    try {
      await api.put(`/registrations/${id}/start-process`);
      toast.success(`Sampel ${noSampel} mulai dianalisis`);
      fetchQueue();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error(err);
      toast.error("Gagal update status");
    }
  };

  const getCounts = (status) => queue.filter((i) => i.status === status).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 md:p-0">
      {/* --- HEADER SECTION (Disamakan dengan SamplerQueue) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
            <FlaskConical size={28} />
          </div>
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Ruang Laboratorium
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Manajemen pengerjaan sampel dan input hasil pemeriksaan.
            </p>
          </div>
        </div>

        {/* Search & Refresh Area */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari No. Sampel / Reg..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={fetchQueue}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("waiting")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "waiting"
              ? "bg-white text-cyan-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package size={16} />
          Menunggu Proses
          <span
            className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${
              activeTab === "waiting"
                ? "bg-cyan-100 text-cyan-700"
                : "bg-gray-200"
            }`}
          >
            {getCounts("diterima_lab")}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("process")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "process"
              ? "bg-white text-yellow-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FlaskConical size={16} />
          Sedang Diuji
          <span
            className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${
              activeTab === "process"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200"
            }`}
          >
            {getCounts("proses_lab")}
          </span>
        </button>
      </div>

      {/* --- MAIN TABLE CARD --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  ID Sampel (Lab)
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Waktu Daftar
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Parameter Pemeriksaan
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm font-medium">
                        Menyinkronkan data lab...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={40} className="text-gray-200" />
                      </div>
                      <h3 className="text-gray-800 font-bold">
                        Data tidak ditemukan
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchQuery
                          ? `Tidak ada hasil untuk "${searchQuery}"`
                          : "Tidak ada sampel pada tahap ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit">
                          {item.no_sampel_lab}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium">
                          Reg: {item.no_reg}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 font-bold text-gray-700">
                          <Clock size={14} className="text-cyan-600" />{" "}
                          {item.waktu_daftar?.slice(0, 5) || "00:00"} WIB
                        </div>
                        <div className="text-[10px] text-gray-400 capitalize">
                          {new Date(item.tgl_daftar).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p
                        className="truncate font-medium text-gray-700"
                        title={item.jenis_pemeriksaan}
                      >
                        {item.jenis_pemeriksaan}
                      </p>
                      {item.catatan_tambahan && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit border border-orange-100">
                          <AlertCircle size={10} /> {item.catatan_tambahan}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {/* BUTTON ACTIONS BERDASARKAN TAB */}
                      {activeTab === "waiting" ? (
                        <button
                          onClick={() =>
                            handleStartProcess(item.id, item.no_sampel_lab)
                          }
                          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 hover:shadow-md transition-all flex items-center gap-2 mx-auto active:scale-95 shadow-orange-100"
                        >
                          <PlayCircle size={16} /> Mulai Analisis
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedSample(item)}
                          className="bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 hover:shadow-md transition-all flex items-center gap-2 mx-auto active:scale-95 shadow-cyan-100"
                        >
                          <FileEdit size={16} /> Input Hasil
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER INFO (Disamakan dengan SamplerQueue) --- */}
        {!loading && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-400">
            <div className="flex items-center gap-4">
              <span>Total Antrian: {filteredData.length} Sampel</span>
              <span className="h-4 w-px bg-gray-200"></span>
              <span className="text-cyan-600">
                Update Terakhir: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              Sistem LIMS <ArrowRight size={10} /> Ruang Lab
            </div>
          </div>
        )}
      </div>

      {/* Modal Input Hasil */}
      {selectedSample && (
        <ResultInputModal
          registrationId={selectedSample.id}
          noSampel={selectedSample.no_sampel_lab}
          onClose={() => {
            setSelectedSample(null);
            fetchQueue();
            if (onRefreshStats) onRefreshStats();
          }}
        />
      )}
    </div>
  );
}
