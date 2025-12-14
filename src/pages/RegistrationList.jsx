import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Tambahkan ini

export default function RegistrationList({ data, onViewDetail, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate(); // Tambahkan hook

  const handleDelete = async (id, noReg) => {
    if (!confirm(`Yakin ingin menghapus registrasi ${noReg}?`)) return;

    try {
      await api.delete(`/registrations/${id}`);
      toast.success("Registrasi berhasil dihapus");
      // Refresh list setelah delete
      if (onRefresh) onRefresh();
    } catch (error) {
      // Hanya tampilkan error jika benar-benar error
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

  if (data.length === 0)
    return (
      <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-sm">
        Belum ada data pasien.
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-4">No. Reg / Sampel</th>
              <th className="px-6 py-4">Identitas Pasien</th>
              <th className="px-6 py-4">Pemeriksaan</th>
              <th className="px-6 py-4">Asal & Status</th>
              <th className="px-6 py-4">Tgl Terima</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-3">
                  <div className="font-bold text-blue-600">{item.no_reg}</div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1 rounded mt-1">
                    {item.no_sampel_lab}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">
                    {item.nama_pasien}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.umur} Th •{" "}
                    {item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                  </div>
                </td>
                <td className="px-6 py-3 font-medium text-gray-700">
                  {item.jenis_pemeriksaan}
                </td>
                <td className="px-6 py-3">
                  <div className="text-xs mb-1 text-gray-500">
                    {item.asal_sampel}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border
                    ${
                      item.status === "selesai"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : item.status === "terdaftar"
                        ? "bg-gray-50 text-gray-600 border-gray-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {new Date(item.tgl_terima).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onViewDetail(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition font-medium text-xs border border-blue-100"
                      title="Detail"
                    >
                      <Eye size={14} /> Detail
                    </button>

                    {/* Tombol Edit untuk role tertentu */}
                    {(user?.role === "admin" ||
                      user?.role === "input" ||
                      user?.role === "lab") && (
                      <button
                        onClick={() => handleEdit(item.id)} // Ganti dengan navigate
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 hover:text-yellow-700 transition font-medium text-xs border border-yellow-100"
                        title="Edit"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    )}

                    {/* Tombol Delete hanya untuk admin */}
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDelete(item.id, item.no_reg)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition font-medium text-xs border border-red-100"
                        title="Hapus"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
