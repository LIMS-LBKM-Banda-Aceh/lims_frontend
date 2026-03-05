// pages/LabQueue.jsx

import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import ResultInputModal from "../components/ResultInputModal";
import { useAuth } from "../context/AuthContext";

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
  ArrowUpDown,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  X,
  Droplets,
  Bug,
  Beef,
  Microscope,
  Building2,
} from "lucide-react";

export default function LabQueue({ onRefreshStats }) {
  const { user } = useAuth();

  const [selectedInstalasi, setSelectedInstalasi] = useState("ALL");

  useEffect(() => {
    if (user?.role === "lab" && user?.instalasi_id) {
      setSelectedInstalasi(user.instalasi_id);
    } else if (user?.role !== "lab") {
      setSelectedInstalasi("ALL");
    }
  }, [user]);

  // --- EXISTING STATE ---
  const [activeTab, setActiveTab] = useState("waiting");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSample, setSelectedSample] = useState(null);

  // --- NEW STATE FOR MAPPING INSTALASI ---
  const [masterMap, setMasterMap] = useState({});
  const [instalasiList, setInstalasiList] = useState([]); // Tambahkan state untuk daftar instalasi

  // --- NEW STATE FOR SORTING & PAGINATION ---
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");

  // --- NEW STATE FOR DETAIL MODAL ---
  const [detailPemeriksaan, setDetailPemeriksaan] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Fetch antrian lab, master pemeriksaan, dan master instalasi secara paralel
      const [queueRes, masterRes, instalasiRes] = await Promise.all([
        api.get("/registrations/lab-queue"),
        api.get("/master/pemeriksaan"),
        api.get("/master/instalasi"), // Tambahkan fetch instalasi
      ]);

      if (instalasiRes.data.success) {
        setInstalasiList(instalasiRes.data.data);
      }

      if (masterRes.data.success) {
        const map = {};
        masterRes.data.data.forEach((item) => {
          map[item.nama_pemeriksaan.toLowerCase().trim()] = {
            id: item.instalasi_id,
            name: item.nama_instalasi || "UMUM",
          };
        });
        setMasterMap(map);
      }

      if (queueRes.data.success) {
        setQueue(queueRes.data.data || []); // Antisipasi jika null
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat antrian lab");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, itemsPerPage, selectedInstalasi]);

  // --- HELPER FUNCTION ---
  const getInstalasiForRegistration = (jenisPemeriksaanString) => {
    if (!jenisPemeriksaanString) return [];

    const examNames = jenisPemeriksaanString.split(",").map((str) =>
      str
        .replace(/\s*\(\d+\)$/, "")
        .trim()
        .toLowerCase(),
    );

    const instIds = new Set();
    examNames.forEach((name) => {
      const inst = masterMap[name];
      if (inst?.id) {
        instIds.add(inst.id);
      } else {
        instIds.add("UMUM");
      }
    });
    return Array.from(instIds);
  };

  // --- LOGIKA BADGE INSTALASI ---
  const renderSampleBadges = (jenisPemeriksaanString) => {
    if (!jenisPemeriksaanString) return null;
    const examNames = jenisPemeriksaanString.split(",").map((str) =>
      str
        .trim()
        .replace(/\s*\(\d+\)$/, "")
        .toLowerCase(),
    );
    const detectedInstalasi = new Set();

    examNames.forEach((name) => {
      const inst = masterMap[name];
      // FIX UTAMA: Pastikan kita mengambil .name dari objek, lalu di toUpperCase()
      if (inst?.name) {
        detectedInstalasi.add(inst.name.toUpperCase());
      }
    });

    if (detectedInstalasi.size === 0) {
      return (
        <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-gray-200 flex items-center gap-1 w-fit mb-1.5">
          <FlaskConical size={10} /> UMUM
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1 mb-1.5">
        {Array.from(detectedInstalasi).map((inst) => {
          if (
            [
              "HEMATOLOGI",
              "KIMIA KLINIK",
              "IMUNOLOGI",
              "SEROLOGI",
              "KLINIK",
            ].some((c) => inst.includes(c))
          ) {
            return (
              <span
                key={inst}
                className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-red-200 flex items-center gap-1"
              >
                <Droplets size={10} /> {inst}
              </span>
            );
          }
          if (inst.includes("URIN")) {
            return (
              <span
                key={inst}
                className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-yellow-200 flex items-center gap-1"
              >
                <FlaskConical size={10} /> {inst}
              </span>
            );
          }
          if (
            ["VEKTOR", "PARASITOLOGI", "ENTOMOLOGI"].some((c) =>
              inst.includes(c),
            )
          ) {
            return (
              <span
                key={inst}
                className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-orange-200 flex items-center gap-1"
              >
                <Bug size={10} /> {inst}
              </span>
            );
          }
          if (
            ["LINGKUNGAN", "AIR", "FISIKA", "LIMBAH"].some((c) =>
              inst.includes(c),
            )
          ) {
            return (
              <span
                key={inst}
                className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-blue-200 flex items-center gap-1"
              >
                <Droplets size={10} /> {inst}
              </span>
            );
          }
          if (
            ["MAKANAN", "MINUMAN", "TOKSIKOLOGI", "KIMIA MAKANAN"].some((c) =>
              inst.includes(c),
            )
          ) {
            return (
              <span
                key={inst}
                className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-emerald-200 flex items-center gap-1"
              >
                <Beef size={10} /> {inst}
              </span>
            );
          }
          if (
            ["BIOMOLEKULER", "PCR", "MIKROBIOLOGI", "BAKTERIOLOGI"].some((c) =>
              inst.includes(c),
            )
          ) {
            return (
              <span
                key={inst}
                className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-purple-200 flex items-center gap-1"
              >
                <Microscope size={10} /> {inst}
              </span>
            );
          }
          return (
            <span
              key={inst}
              className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-gray-200 flex items-center gap-1"
            >
              <FlaskConical size={10} /> {inst}
            </span>
          );
        })}
      </div>
    );
  };

  // --- LOGIKA FILTER + SORT + PAGINATION ---
  const processedData = useMemo(() => {
    // Tambahkan pengaman: Pastikan queue adalah array
    if (!Array.isArray(queue)) return [];

    let filtered = queue.filter((item) => {
      // 1. Filter Status Tab
      let matchesTab = false;
      if (activeTab === "waiting") matchesTab = item.status === "diterima_lab";
      if (activeTab === "process") matchesTab = item.status === "proses_lab";

      // 2. Filter Instalasi
      let matchesInstalasi = true;
      if (selectedInstalasi !== "ALL") {
        const itemInstalasiIds = getInstalasiForRegistration(
          item.jenis_pemeriksaan,
        );

        // FIX: Gunakan String() agar tidak terjadi miss-match antara ID DB (Int) dan State (String)
        matchesInstalasi =
          itemInstalasiIds.some(
            (id) => String(id) === String(selectedInstalasi),
          ) || String(selectedInstalasi) === String(item.instalasi_id);
      }

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (item.no_sampel_lab || "").toLowerCase().includes(query) ||
        (item.no_reg || "").toLowerCase().includes(query) ||
        (item.nama_pasien || "").toLowerCase().includes(query);

      return matchesTab && matchesInstalasi && matchesSearch;
    });

    filtered.sort((a, b) => {
      // Ambil timestamp dari created_at (prioritas) atau tgl_daftar, plus aman dari NaN
      const dateA = new Date(a?.created_at || a?.tgl_daftar).getTime();
      const dateB = new Date(b?.created_at || b?.tgl_daftar).getTime();

      const timeA = Number.isNaN(dateA) ? 0 : dateA;
      const timeB = Number.isNaN(dateB) ? 0 : dateB;

      if (sortBy === "newest") {
        return timeB - timeA;
      }
      if (sortBy === "oldest") {
        return timeA - timeB;
      }
      if (sortBy === "sample_asc") {
        return (a.no_sampel_lab || "").localeCompare(b.no_sampel_lab || "");
      }
      if (sortBy === "urgent") {
        return (b.catatan_tambahan ? 1 : 0) - (a.catatan_tambahan ? 1 : 0);
      }
      return 0;
    });

    return filtered;
  }, [queue, activeTab, searchQuery, sortBy, selectedInstalasi, masterMap]); // Pastikan dependency lengkap

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // --- ACTIONS ---
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

  const getCounts = (status) => {
    // Pastikan queue adalah array
    if (!Array.isArray(queue)) return 0;

    return queue.filter((item) => {
      if (item.status !== status) return false;
      if (selectedInstalasi === "ALL") return true;
      const itemInstalasiIds = getInstalasiForRegistration(
        item.jenis_pemeriksaan,
      );
      return itemInstalasiIds.includes(selectedInstalasi);
    }).length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 md:p-0">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
            <FlaskConical size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Ruang Laboratorium
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Manajemen pengerjaan sampel dan input hasil pemeriksaan.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-40">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <ArrowUpDown size={16} />
            </div>
            <select
              className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-semibold text-gray-600 appearance-none cursor-pointer hover:bg-gray-50 transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="sample_asc">No. Sampel (A-Z)</option>
              <option value="urgent">Prioritas Catatan</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative flex-1 md:w-64 w-full">
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
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm hidden md:block"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {user?.role !== "lab" && instalasiList && instalasiList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar -mt-2">
          <button
            onClick={() => setSelectedInstalasi("ALL")}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
              selectedInstalasi === "ALL"
                ? "bg-cyan-600 border-cyan-600 text-white shadow-md"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Building2 size={16} /> SEMUA INSTALASI
          </button>
          {instalasiList.map((inst) => (
            <button
              key={inst.id}
              onClick={() => setSelectedInstalasi(inst.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                selectedInstalasi === inst.id
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-md"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {inst.nama_instalasi.toUpperCase()}
            </button>
          ))}
        </div>
      )}

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
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
              ) : paginatedData.length === 0 ? (
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
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col mt-0.5">
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit">
                          {item.no_sampel_lab}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium">
                          Reg: {item.no_reg}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-0.5 mt-0.5">
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
                            },
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs align-top">
                      <div className="flex flex-col">
                        {/* --- UX IMPROVEMENT: Badge Instalasi di atas --- */}
                        {renderSampleBadges(item.jenis_pemeriksaan)}
                        {/* --------------------------------------------- */}

                        <div className="flex items-start justify-between gap-2 mt-0.5">
                          <p
                            className="truncate font-medium text-gray-700 flex-1 text-xs leading-relaxed"
                            title={item.jenis_pemeriksaan}
                          >
                            {item.jenis_pemeriksaan}
                          </p>
                          <button
                            onClick={() => setDetailPemeriksaan(item)}
                            className="p-1 text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded md:opacity-50 group-hover:opacity-100 transition-all flex-shrink-0"
                            title="Lihat Detail Pemeriksaan"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                        {item.catatan_tambahan && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit border border-orange-100">
                            <AlertCircle size={10} /> {item.catatan_tambahan}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center align-top">
                      <div className="mt-0.5">
                        {activeTab === "waiting" ? (
                          <button
                            onClick={() =>
                              handleStartProcess(item.id, item.no_sampel_lab)
                            }
                            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 hover:shadow-md transition-all flex items-center gap-2 mx-auto active:scale-95 shadow-orange-100 w-full justify-center max-w-[140px]"
                          >
                            <PlayCircle size={16} /> Mulai Analisis
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedSample(item)}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-700 hover:shadow-md transition-all flex items-center gap-2 mx-auto active:scale-95 shadow-cyan-100 w-full justify-center max-w-[140px]"
                          >
                            <FileEdit size={16} /> Input Hasil
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER INFO & PAGINATION --- */}
        {!loading && processedData.length > 0 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <span className="whitespace-nowrap">
                Total: {processedData.length} Sampel
              </span>

              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <span className="text-gray-400 hidden sm:inline">
                  Tampilkan:
                </span>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white border border-gray-200 text-gray-700 py-1 pl-2 pr-6 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <ListFilter
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="px-2">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
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

      {/* --- MODAL: Detail Parameter Pemeriksaan --- */}
      {detailPemeriksaan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform scale-100">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ListFilter size={18} className="text-cyan-600" />
                Detail Pemeriksaan
              </h3>
              <button
                onClick={() => setDetailPemeriksaan(null)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Nomor Sampel
                </span>
                <p className="font-mono font-bold text-gray-800 text-lg mt-0.5">
                  {detailPemeriksaan.no_sampel_lab}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Parameter yang Diuji</span>
                </span>
                <div className="mt-1.5 p-3.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 border border-gray-100 max-h-48 overflow-y-auto leading-relaxed">
                  {detailPemeriksaan.jenis_pemeriksaan
                    .split(",")
                    .map((param, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 mb-1.5 last:mb-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                        <span>{param.trim()}</span>
                      </div>
                    ))}
                </div>
              </div>

              {detailPemeriksaan.catatan_tambahan && (
                <div>
                  <span className="text-[11px] text-orange-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle size={12} /> Catatan Khusus
                  </span>
                  <div className="mt-1.5 p-3 bg-orange-50/50 rounded-xl text-sm font-medium text-orange-700 border border-orange-100">
                    {detailPemeriksaan.catatan_tambahan}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setDetailPemeriksaan(null)}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors shadow-sm"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
