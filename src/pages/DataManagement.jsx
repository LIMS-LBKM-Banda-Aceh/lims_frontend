// src/pages/DataManagement.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  FileBarChart,
  Printer,
  Download,
  Search,
  Calendar,
  Pencil,
  Trash2,
  ArrowUpDown,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  User,
  ArrowRight,
  Microscope,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import LHUPrintTemplate from "../components/LHUPrintTemplate";
import ResultInputModal from "../components/ResultInputModal";
import { useAuth } from "../context/AuthContext";

export default function DataManagement({ onRefreshStats }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- EXISTING STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForPrint, setSelectedForPrint] = useState(null);
  const [previewData, setPreviewData] = useState(null); // (Sisa state untuk logic ACC/Preview jika diperlukan kedepannya)
  const [isEditingResult, setIsEditingResult] = useState(false);

  // --- NEW STATE FOR SORTING & PAGINATION (UI CONTROL) ---
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name_asc

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data laporan");
    } finally {
      setTimeout(() => setLoading(false), 500); // Smooth loading
    }
  };

  // --- LOGIC VIEW LAYER (FILTER + SORT + PAGINATION) ---
  const processedData = useMemo(() => {
    // 1. Filter Search
    let filtered = data.filter(
      (item) =>
        (item.nama_pasien || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.no_reg || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.no_sampel_lab || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

    // 2. Sorting Logic
    filtered.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "name_asc")
        return a.nama_pasien.localeCompare(b.nama_pasien);
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortBy]);

  // 3. Pagination Logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // --- EXISTING LOGIC HANDLERS (UNTOUCHED) ---

  const handleOpenPreview = async (id) => {
    const toastId = toast.loading("Memuat rincian hasil...");
    try {
      const regRes = await api.get(`/registrations/${id}`);
      const testRes = await api.get(`/registrations/${id}/tests`);

      if (regRes.data.success && testRes.data.success) {
        setPreviewData({
          ...regRes.data.data,
          tests: testRes.data.data,
        });
        toast.dismiss(toastId);
      }
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: "Gagal memuat detail data",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const refreshPreviewData = async () => {
    if (!previewData) return;
    setIsEditingResult(false);
    await handleOpenPreview(previewData.id);
    toast.success("Data hasil berhasil diperbarui");
  };

  const handleDelete = async (id) => {
    if (
      globalThis.confirm(
        "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.",
      )
    ) {
      const toastId = toast.loading("Menghapus data...");
      try {
        await api.delete(`/registrations/${id}`);
        toast.update(toastId, {
          render: "Data berhasil dihapus.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        fetchData();
        if (onRefreshStats) onRefreshStats();
      } catch (error) {
        console.error("Error deleting registration:", error);
        toast.update(toastId, {
          render: `Gagal menghapus: ${error.response?.data?.message || error.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }
  };

  const exportToExcel = async () => {
    // Gunakan processedData (hasil filter & sort) untuk export, bukan paginatedData
    if (processedData.length === 0) {
      toast.warn("Tidak ada data untuk diexport");
      return;
    }

    const toastId = toast.loading("Menyiapkan format laporan yang rapi...");
    try {
      const enrichedData = await Promise.all(
        processedData.map(async (item) => {
          try {
            const res = await api.get(`/registrations/${item.id}/tests`);
            const testsData = res.data.success ? res.data.data : [];
            return { ...item, tests: testsData };
          } catch (err) {
            return item;
          }
        }),
      );

      const rawDataRows = [];
      const merges = [];
      const headers = [
        "No",
        "No. Registrasi",
        "No. Sampel",
        "Tanggal Daftar",
        "Nama Pasien",
        "NIK",
        "JK",
        "Umur",
        "Alamat",
        "Pengirim",
        "Asal Sampel",
        "Status",
        "Catatan",
        "Parameter Uji",
        "Hasil",
        "Satuan",
        "Nilai Rujukan",
        "Metode",
      ];
      let currentRow = 0;
      const TOP_OFFSET = 8;

      enrichedData.forEach((item, index) => {
        const tests = item.tests && item.tests.length > 0 ? item.tests : [];
        const rowSpan = tests.length > 0 ? tests.length : 1;
        const patientInfo = [
          index + 1,
          item.no_reg,
          item.no_sampel_lab || "-",
          new Date(item.tgl_daftar).toLocaleDateString("id-ID"),
          item.nama_pasien,
          item.nik ? `'${item.nik}` : "-",
          item.jenis_kelamin,
          `${item.umur} Th`,
          item.alamat || "-",
          item.pengirim_instansi || "Mandiri",
          item.asal_sampel,
          item.status.replace("_", " ").toUpperCase(),
          item.catatan_tambahan || "-",
        ];

        if (tests.length > 0) {
          tests.forEach((tes, testIndex) => {
            const rowData = [
              ...(testIndex === 0 ? patientInfo : Array(13).fill("")),
              tes.nama_pemeriksaan || tes.parameter_name,
              tes.nilai || tes.result || "Belum ada",
              tes.satuan || "-",
              tes.nilai_rujukan || "-",
              tes.metode || "-",
            ];
            rawDataRows.push(rowData);
          });
        } else {
          rawDataRows.push([
            ...patientInfo,
            item.jenis_pemeriksaan,
            "-",
            "-",
            "-",
            "-",
          ]);
        }

        if (rowSpan > 1) {
          for (let col = 0; col <= 12; col++) {
            merges.push({
              s: { r: TOP_OFFSET + currentRow, c: col },
              e: { r: TOP_OFFSET + currentRow + rowSpan - 1, c: col },
            });
          }
        }
        currentRow += rowSpan;
      });

      const reportTitle = [["LAPORAN DATA PEMERIKSAAN LABORATORIUM (LIMS)"]];
      const reportSubtitle = [
        ["BALAI LABORATORIUM KESEHATAN MASYARAKAT BANDA ACEH"],
      ];
      const exportDate = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const exportTime = new Date().toLocaleTimeString("id-ID");

      const metadata = [
        [""],
        ["Tanggal Export:", `${exportDate} Pukul ${exportTime}`],
        [
          "Total Data:",
          `${enrichedData.length} Pasien (${rawDataRows.length} Baris Uji)`,
        ],
        ["Filter Pencarian:", searchTerm ? `'${searchTerm}'` : "Semua Data"],
        [""],
      ];

      const finalData = [
        ...reportTitle,
        ...reportSubtitle,
        ...metadata,
        headers,
        ...rawDataRows,
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(finalData);
      const headerMerges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
      ];
      worksheet["!merges"] = [...headerMerges, ...merges];

      const colWidths = headers.map((header, colIndex) => {
        let maxLength = header.length;
        for (let i = 0; i < Math.min(rawDataRows.length, 50); i++) {
          const cellValue = rawDataRows[i][colIndex]
            ? String(rawDataRows[i][colIndex])
            : "";
          if (cellValue.length > maxLength) maxLength = cellValue.length;
        }
        return { wch: maxLength + 4 };
      });
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan LIMS");
      XLSX.writeFile(
        workbook,
        `Laporan_LIMS_Clean_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.dismiss(toastId);
      toast.success("Laporan (Clean Layout) berhasil didownload");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.dismiss(toastId);
      toast.error("Gagal melakukan export data");
    }
  };

  const handlePrintLHU = async (id) => {
    const toastId = toast.loading("Menyiapkan dokumen...");
    try {
      const res = await api.get(`/registrations/${id}`);
      const regData = res.data.data;
      const testRes = await api.get(`/registrations/${id}/tests`);
      regData.tests = testRes.data.data;

      if (!regData.tests || regData.tests.length === 0) {
        toast.update(toastId, {
          render: "Belum ada hasil uji untuk dicetak",
          type: "warning",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }
      setSelectedForPrint(regData);
      setTimeout(() => {
        toast.dismiss(toastId);
        globalThis.print();
      }, 800);
    } catch (e) {
      console.error("Error saat print LHU:", e);
      toast.update(toastId, {
        render: "Gagal memuat data print",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      selesai: "bg-green-100 text-green-700 border-green-200",
      selesai_uji: "bg-blue-100 text-blue-700 border-blue-200",
      proses_lab: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    const style = styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border ${style}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 md:p-0">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        {/* BAGIAN KIRI: Tetap di Kiri */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <FileBarChart size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Manajemen Laporan
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Cetak hasil uji (LHU) dan export data laporan.
            </p>
          </div>
        </div>

        {/* --- CONTROLS & FILTER --- */}
        {/* PERUBAHAN DISINI: Tambahkan 'md:ml-auto' agar elemen ini terdorong ke kanan */}
        <div className="flex flex-col md:flex-row items-center gap-4 print:hidden md:ml-auto w-full md:w-auto">
          {/* Left: Search & Sort */}
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* SORTING */}
            <div className="relative group w-full md:w-44">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <ArrowUpDown size={16} />
              </div>
              <select
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-gray-600 appearance-none cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name_asc">Nama (A-Z)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari Data Pasien..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Refresh */}
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm hidden md:block"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Action Button (Export) - Posisi ini sekarang akan menempel setelah Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={exportToExcel}
            className="w-full md:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* --- TABLE CARD --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Informasi Pasien
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Detail Laporan
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Status
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
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm font-medium">
                        Memuat data laporan...
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
                        {searchTerm
                          ? "Tidak ada hasil pencarian."
                          : "Belum ada laporan data yang tersedia."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Kolom 1: Pasien */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 group-hover:border-blue-200 transition-all shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">
                            {item.nama_pasien}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold border border-gray-200">
                              {item.no_reg}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Detail Lab */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-700 text-xs font-semibold">
                          <Microscope size={14} className="text-blue-500" />
                          ID Lab:{" "}
                          <span className="font-mono">
                            {item.no_sampel_lab || "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                          <Calendar size={12} />
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom 3: Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Kolom 4: Aksi */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {item.status === "selesai" ? (
                          <button
                            onClick={() => handlePrintLHU(item.id)}
                            className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 shadow-md shadow-purple-100 active:scale-95 transition-all"
                            title="Cetak LHU"
                          >
                            <Printer size={16} /> Cetak
                          </button>
                        ) : (
                          <span className="text-gray-400 italic text-[10px] bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                            {item.status === "selesai_uji"
                              ? "Menunggu Validasi"
                              : "Belum Selesai"}
                          </span>
                        )}

                        {(user?.role === "manajemen" || user?.role === "admin") && (
                          <div className="flex gap-1 ml-2 pl-2 border-l border-gray-200">
                            <button
                              onClick={() =>
                                navigate(`/registrations/edit/${item.id}`)
                              }
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                              title="Edit Data Pasien"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                              title="Hapus Data"
                            >
                              <Trash2 size={14} />
                            </button>
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

        {/* --- FOOTER INFO & PAGINATION --- */}
        {!loading && processedData.length > 0 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
            {/* Left: Total & Rows Per Page */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <span className="whitespace-nowrap">
                Total: {processedData.length} Data
              </span>

              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <span className="text-gray-400 hidden sm:inline">
                  Tampilkan:
                </span>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white border border-gray-200 text-gray-700 py-1 pl-2 pr-6 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
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

        {!loading && (
          <div className="bg-gray-50 px-6 py-2 border-t border-gray-200 text-[10px] text-gray-400 font-bold flex justify-end items-center gap-1 print:hidden">
            Sistem LIMS <ArrowRight size={10} /> Manajemen Data
          </div>
        )}
      </div>

      {/* --- MODAL EDIT HASIL (RE-USE EXISTING COMPONENT) --- */}
      {isEditingResult && previewData && (
        <ResultInputModal
          registrationId={previewData.id}
          noSampel={previewData.no_sampel_lab}
          onClose={refreshPreviewData}
        />
      )}

      {/* Component Cetak Hidden */}
      {selectedForPrint && (
        <div
          id="print-section"
          className="hidden print:block absolute top-0 left-0 w-full h-auto min-h-screen bg-white z-[9999]"
        >
          <LHUPrintTemplate data={selectedForPrint} />
        </div>
      )}
    </div>
  );
}
