// pages/RegistrationList.jsx

import { useState, useMemo } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Wallet,
  FileText,
  Search,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function RegistrationList({ data, onViewDetail, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- NEW STATE FOR FILTER, SORT, & LIMIT ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' (terbaru) or 'asc' (terlama)
  const [rowsLimit, setRowsLimit] = useState(25); // 25, 50, 100
  // -------------------------------------------

  const formatDateSafe = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } catch (e) {
      console.error(e);
      return "-";
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  const handleDelete = async (id, noReg) => {
    if (!confirm(`Yakin ingin menghapus registrasi ${noReg}?`)) return;
    try {
      await api.delete(`/registrations/${id}`);
      toast.success("Registrasi berhasil dihapus");
      if (onRefresh) onRefresh();
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(
          error.response?.data?.message || "Gagal menghapus registrasi"
        );
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/registrations/edit/${id}`);
  };

  // --- LOGIC: FILTERING & SORTING ---
  const processedData = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    // 1. Searching
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.nama_pasien?.toLowerCase().includes(lowerTerm) ||
          item.no_reg?.toLowerCase().includes(lowerTerm) ||
          item.no_sampel_lab?.toLowerCase().includes(lowerTerm) ||
          item.jenis_pemeriksaan?.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Sorting (Based on tgl_daftar/id)
    result.sort((a, b) => {
      // Prioritas sort by ID desc (asumsi ID besar = data baru) atau tgl_daftar
      // Jika ingin by tanggal murni:
      const dateA = new Date(a.tgl_daftar || 0);
      const dateB = new Date(b.tgl_daftar || 0);

      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    // 3. Limiting
    return result.slice(0, rowsLimit);
  }, [data, searchTerm, sortOrder, rowsLimit]);

  // Handle Sort Toggle
  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };
  // ----------------------------------

  const StatusBadge = ({ status }) => {
    const styles = {
      selesai: "bg-green-100 text-green-700 border-green-200",
      terdaftar: "bg-blue-50 text-blue-700 border-blue-200",
      diterima_lab: "bg-indigo-50 text-indigo-700 border-indigo-200",
      proses_lab: "bg-yellow-50 text-yellow-700 border-yellow-200",
      selesai_uji: "bg-purple-50 text-purple-700 border-purple-200",
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

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (!data || data.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-dashed border-gray-300 text-center animate-fade-in">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <MoreHorizontal className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Belum ada data</h3>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          Data pasien yang Anda daftarkan akan muncul di sini.
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in flex flex-col">
      {/* --- NEW TOOLBAR SECTION --- */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama, no reg, atau sampel..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Controls: Limit & Sort */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Row Limit Dropdown */}
          <div className="relative group">
            <select
              value={rowsLimit}
              onChange={(e) => setRowsLimit(Number(e.target.value))}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Sort Button */}
          <button
            onClick={toggleSort}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-95"
            title={
              sortOrder === "desc" ? "Urutkan: Terlama" : "Urutkan: Terbaru"
            }
          >
            <ArrowUpDown size={14} className="text-gray-500" />
            <span>{sortOrder === "desc" ? "Terbaru" : "Terlama"}</span>
          </button>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Info Pasien
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                No. Reg / Sampel
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Pemeriksaan & Biaya
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processedData.length > 0 ? (
              processedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/80 transition-colors duration-200 group"
                >
                  {/* Info Pasien */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-xs border border-blue-50 shrink-0">
                        {getInitials(item.nama_pasien)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          <span className="text-l font-bold text-gray-400 hidden">
                            Nama:{" "}
                          </span>
                          {item.nama_pasien}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="text-xs font-bold text-gray-400">
                            Umur:{" "}
                          </span>
                          {item.umur ? `${item.umur} Th` : "-"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="text-xs font-bold text-gray-400">
                            JK:{" "}
                          </span>
                          {item.jenis_kelamin === "L"
                            ? "Laki-laki"
                            : "Perempuan"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* No Reg */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {item.no_reg}
                      </span>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        Lab: {item.no_sampel_lab || "-"}
                      </span>
                    </div>
                  </td>

                  {/* Pemeriksaan & Biaya */}
                  <td className="px-6 py-4">
                    <div
                      className="max-w-[200px] truncate text-sm text-gray-700 font-medium"
                      title={item.jenis_pemeriksaan}
                    >
                      {item.jenis_pemeriksaan}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {item.status_pembayaran === "gratis" ? (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-green-200">
                          GRATIS / SUBSIDI
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-cyan-700 font-bold text-xs">
                          <Wallet size={12} />
                          {formatRupiah(item.total_biaya)}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 whitespace-nowrap">
                      <span>Daftar: {formatDateSafe(item.tgl_daftar)}</span>
                      {item.catatan_tambahan && (
                        <FileText
                          size={10}
                          className="text-orange-400 ml-1"
                          title="Ada catatan tambahan"
                        />
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <span>Pukul: {item.waktu_daftar?.slice(0, 5)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <StatusBadge status={item.status} />
                      <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {item.asal_sampel}
                      </span>
                    </div>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => onViewDetail(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>

                      {(user?.role === "admin" ||
                        (user?.role === "input" &&
                          item.status === "terdaftar")) && (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Edit size={18} />
                        </button>
                      )}

                      {(user?.role === "admin" ||
                        (user?.role === "input" &&
                          item.status === "terdaftar")) && (
                        <button
                          onClick={() => handleDelete(item.id, item.no_reg)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={
                            user?.role === "admin"
                              ? "Hapus Permanen"
                              : "Hapus Registrasi"
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* --- EMPTY SEARCH STATE --- */
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="text-gray-300 h-6 w-6" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">
                      Tidak ditemukan data untuk "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Reset pencarian
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Menampilkan {processedData.length} dari {data.length} data
          {searchTerm && " (difilter)"}
        </span>

        {/* Optional: Simple Pagination Info if needed later */}
        <span className="hidden md:inline-block opacity-60">
          Diurutkan berdasarkan: {sortOrder === "desc" ? "Terbaru" : "Terlama"}
        </span>
      </div>
    </div>
  );
}

RegistrationList.propTypes = {
  data: PropTypes.array.isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};
