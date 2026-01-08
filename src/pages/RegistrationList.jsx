// pages/RegistrationList.jsx

import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Wallet,
  FileText,
} from "lucide-react"; // Tambah icon FileText
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function RegistrationList({ data, onViewDetail, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
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
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/80 transition-colors duration-200 group"
              >
                {/* Info Pasien */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-xs border border-blue-50">
                      {getInitials(item.nama_pasien)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.nama_pasien}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.umur} Th •{" "}
                        {item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* No Reg */}
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {item.no_reg}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Lab: {item.no_sampel_lab || "-"}
                    </span>
                  </div>
                </td>

                {/* Pemeriksaan & Biaya (UPDATED) */}
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

                  <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <span>Terima: {formatDateSafe(item.tgl_terima)}</span>
                    {item.catatan_tambahan && (
                      <FileText
                        size={10}
                        className="text-orange-400 ml-1"
                        title="Ada catatan tambahan"
                      />
                    )}
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
                      user?.role === "input" ||
                      user?.role === "lab") && (
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDelete(item.id, item.no_reg)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Permanen"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <span>Menampilkan {data.length} data terbaru</span>
      </div>
    </div>
  );
}

RegistrationList.propTypes = {
  data: PropTypes.array.isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};
