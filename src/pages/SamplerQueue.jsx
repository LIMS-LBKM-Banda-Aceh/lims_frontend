// pages/SamplerQueue.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

import {
  Syringe,
  Clock,
  CheckCircle2,
  PlayCircle,
  Send,
  AlertCircle,
  Search,
  User,
  FlaskConical,
  ClipboardList,
  RefreshCw,
  Bug,
  Droplets,
  Beef,
  Microscope,
  ArrowUpDown,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function SamplerQueue({ onRefreshStats }) {
  // --- EXISTING STATE ---
  const [activeTab, setActiveTab] = useState("queue");
  const [dataList, setDataList] = useState([]);
  const [masterMap, setMasterMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- NEW STATE FOR SORTING & PAGINATION ---
  const [itemsPerPage, setItemsPerPage] = useState(25); // Default 25 baris
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest"); // Options: newest, oldest, name_asc

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [regRes, masterRes] = await Promise.all([
        api.get("/registrations"),
        api.get("/master/pemeriksaan"),
      ]);

      if (masterRes.data.success) {
        const map = {};
        masterRes.data.data.forEach((item) => {
          map[item.nama_pemeriksaan.toLowerCase()] = item.kategori;
        });
        setMasterMap(map);
      }

      if (regRes.data.success) {
        const relevantData = regRes.data.data.filter((item) =>
          ["terdaftar", "proses_sampling"].includes(item.status),
        );
        setDataList(relevantData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat antrian sampler");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page ke 1 saat tab atau search berubah agar UX konsisten
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, itemsPerPage]);

  const renderSampleBadges = (jenisPemeriksaanString) => {
    if (!jenisPemeriksaanString) return null;
    const examNames = jenisPemeriksaanString.split(",").map((str) =>
      str
        .trim()
        .replace(/\s*\(\d+\)$/, "")
        .toLowerCase(),
    );
    const detectedCategories = new Set();
    examNames.forEach((name) => {
      const cat = masterMap[name];
      if (cat) detectedCategories.add(cat.toUpperCase());
    });

    if (detectedCategories.size === 0) {
      return (
        <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-gray-200 flex items-center gap-1 w-fit">
          <FlaskConical size={10} /> SAMPEL UMUM
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {Array.from(detectedCategories).map((cat) => {
          if (
            ["HEMATOLOGI", "KIMIA KLINIK", "IMUNOLOGI", "SEROLOGI"].some((c) =>
              cat.includes(c),
            )
          ) {
            return (
              <span
                key={cat}
                className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-red-200 flex items-center gap-1"
              >
                <Droplets size={10} /> {cat}
              </span>
            );
          }
          if (cat.includes("URIN")) {
            return (
              <span
                key={cat}
                className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-yellow-200 flex items-center gap-1"
              >
                <FlaskConical size={10} /> {cat}
              </span>
            );
          }
          if (
            ["VEKTOR", "PARASITOLOGI", "ENTOMOLOGI"].some((c) =>
              cat.includes(c),
            )
          ) {
            return (
              <span
                key={cat}
                className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-orange-200 flex items-center gap-1"
              >
                <Bug size={10} /> {cat}
              </span>
            );
          }
          if (
            ["LINGKUNGAN", "AIR", "FISIKA", "LIMBAH"].some((c) =>
              cat.includes(c),
            )
          ) {
            return (
              <span
                key={cat}
                className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-blue-200 flex items-center gap-1"
              >
                <Droplets size={10} /> {cat}
              </span>
            );
          }
          if (
            ["MAKANAN", "MINUMAN", "TOKSIKOLOGI", "KIMIA MAKANAN"].some((c) =>
              cat.includes(c),
            )
          ) {
            return (
              <span
                key={cat}
                className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-emerald-200 flex items-center gap-1"
              >
                <Beef size={10} /> {cat}
              </span>
            );
          }
          if (
            ["BIOMOLEKULER", "PCR", "MIKROBIOLOGI", "BAKTERIOLOGI"].some((c) =>
              cat.includes(c),
            )
          ) {
            return (
              <span
                key={cat}
                className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-purple-200 flex items-center gap-1"
              >
                <Microscope size={10} /> {cat}
              </span>
            );
          }
          return (
            <span
              key={cat}
              className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-gray-200 flex items-center gap-1"
            >
              <FlaskConical size={10} /> {cat}
            </span>
          );
        })}
      </div>
    );
  };

  // --- LOGIKA FILTER + SORT + PAGINATION ---
  const processedData = useMemo(() => {
    // 1. Filter Tab & Search
    let filtered = dataList.filter((item) => {
      const matchesTab =
        activeTab === "queue"
          ? item.status === "terdaftar"
          : item.status === "proses_sampling";
      const matchesSearch =
        item.nama_pasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.no_reg.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    // 2. Sorting Logic
    filtered.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "name_asc")
        return a.nama_pasien.localeCompare(b.nama_pasien);
      if (sortBy === "urgent")
        return (b.catatan_tambahan ? 1 : 0) - (a.catatan_tambahan ? 1 : 0); // Prioritas yg ada catatan
      return 0;
    });

    return filtered;
  }, [dataList, activeTab, searchQuery, sortBy]);

  // 3. Slicing for Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // --- ACTIONS ---
  const handleStartSampling = async (id, noReg) => {
    try {
      await api.put(`/registrations/${id}/start-sampling`);
      toast.info(`Mulai pengambilan sampel: ${noReg}`);
      fetchData();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memulai proses sampling");
    }
  };

  const handleSendToLab = async (id, noReg) => {
    if (
      !confirm(
        `Konfirmasi: Sampel ${noReg} sudah selesai diambil dan siap dikirim ke Lab?`,
      )
    )
      return;
    try {
      await api.put(`/registrations/${id}/send-to-lab`);
      toast.success(`Sampel ${noReg} diteruskan ke Laboratorium!`);
      fetchData();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim ke lab");
    }
  };

  const getCounts = (status) =>
    dataList.filter((i) => i.status === status).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
            <Syringe size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Ruang Sampling
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Petugas: Silahkan proses pengambilan sampel fisik.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* SORTING DROPDOWN (NEW) */}
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
              <option value="name_asc">Nama (A-Z)</option>
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
              placeholder="Cari Nama / No. Reg..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm hidden md:block"
            title="Refresh Antrian"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "queue"
              ? "bg-white text-cyan-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock size={16} />
          Antrian Baru
          <span
            className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${activeTab === "queue" ? "bg-cyan-100 text-cyan-700" : "bg-gray-200"}`}
          >
            {getCounts("terdaftar")}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("process")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === "process"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FlaskConical size={16} />
          Sedang Sampling
          <span
            className={`ml-1 px-2 py-0.5 rounded-md text-[10px] ${activeTab === "process" ? "bg-orange-100 text-orange-600" : "bg-gray-200"}`}
          >
            {getCounts("proses_sampling")}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {" "}
          {/* Min height added to prevent jumping */}
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Data Pasien
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Detail Pemeriksaan
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Status & Waktu
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  Tindakan
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
                        Menyinkronkan data antrian...
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
                        Tidak ada antrian
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Semua pasien pada tahap ini telah selesai diproses.
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
                    {/* Kolom 1: Identitas */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500 border border-gray-200 group-hover:from-cyan-50 group-hover:to-blue-50 group-hover:border-cyan-100 transition-all shrink-0">
                          <User size={20} />
                          <span className="text-[9px] font-bold uppercase">
                            {item.jenis_kelamin}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base leading-tight">
                            {item.nama_pasien}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold border border-gray-200">
                              {item.no_reg}
                            </span>
                            <span className="text-xs text-gray-400 font-medium text-center">
                              {item.umur} Tahun
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Pemeriksaan & Badges */}
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-2">
                        {renderSampleBadges(item.jenis_pemeriksaan)}
                        <p
                          className="text-xs text-gray-600 font-medium line-clamp-2 italic"
                          title={item.jenis_pemeriksaan}
                        >
                          {item.jenis_pemeriksaan}
                        </p>
                        {item.catatan_tambahan && (
                          <div className="flex items-start gap-1 text-[11px] text-orange-600 bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                            <ClipboardList
                              size={12}
                              className="mt-0.5 shrink-0"
                            />
                            <span>Catatan: {item.catatan_tambahan}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kolom 3: Waktu */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={14} className="text-gray-400" />
                          <span>
                            Terdaftar:{" "}
                            {new Date(item.created_at).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}{" "}
                            WIB
                          </span>
                        </div>
                        {item.status === "proses_sampling" && (
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-md animate-pulse">
                            <Syringe size={14} />
                            <span>Sedang Diambil...</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kolom 4: Aksi */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-center">
                        {item.status === "terdaftar" ? (
                          <button
                            onClick={() =>
                              handleStartSampling(item.id, item.no_reg)
                            }
                            className="group/btn relative overflow-hidden bg-cyan-600 text-white pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-all shadow-md shadow-cyan-100 active:scale-95 flex items-center gap-2"
                          >
                            Proses Sampling
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-cyan-500 flex items-center justify-center group-hover/btn:w-10 transition-all">
                              <PlayCircle size={18} />
                            </div>
                          </button>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() =>
                                handleSendToLab(item.id, item.no_reg)
                              }
                              className="bg-green-600 text-white px-2 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100 active:scale-95 flex items-center gap-2"
                            >
                              <Send size={16} /> Teruskan Ke Lab
                            </button>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                              <AlertCircle
                                size={12}
                                className="text-orange-400"
                              />{" "}
                              Periksa Label
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info & Pagination (MODIFIED) */}
        {!loading && processedData.length > 0 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
            {/* Left: Total & Rows Per Page */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <span className="whitespace-nowrap">
                Total: {processedData.length} Pasien
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

            {/* Right: Pagination Controls */}
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
    </div>
  );
}
