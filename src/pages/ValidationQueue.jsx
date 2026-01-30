// src/pages/ValidationQueue.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  FileCheck,
  Search,
  Loader2,
  CheckCircle2,
  FileText,
  Calendar,
  PlayCircle,
  X,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ValidationQueue({ onRefreshStats }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Preview Modal
  const [previewData, setPreviewData] = useState(null);
  const [processingAcc, setProcessingAcc] = useState(false);

  const calculateDuration = (start, end) => {
    if (!start || !end) return "-";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffInMs = endTime - startTime;

    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    if (diffInMins < 60) return `${diffInMins} Menit`;

    const hours = Math.floor(diffInMins / 60);
    const mins = diffInMins % 60;
    return `${hours} Jam ${mins} Menit`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations");
      if (res.data.success) {
        // Filter hanya data dengan status "selesai_uji" (menunggu validasi)
        const waitingValidation = res.data.data.filter(
          (item) => item.status === "selesai_uji",
        );
        // Sort terbaru di atas
        const sortedData = waitingValidation.sort((a, b) => b.id - a.id);
        setData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching validation data:", error);
      toast.error("Gagal memuat data validasi");
    } finally {
      setLoading(false);
    }
  };

  // Buka Modal Preview
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

  // Eksekusi ACC (Finalize)
  const handleApprove = async () => {
    if (!previewData) return;

    setProcessingAcc(true);
    try {
      const res = await api.put(`/registrations/${previewData.id}/finalize`);
      if (res.data.success) {
        toast.success("Data berhasil di-ACC. LHU siap dicetak.");

        // DEBUG: Tampilkan info validator
        console.log("Validator yang melakukan ACC:", res.data.data?.validator);

        setPreviewData(null);
        fetchData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (error) {
      console.error(error);

      // Tampilkan error yang lebih spesifik
      if (error.response?.data?.message) {
        toast.error(`Gagal melakukan ACC: ${error.response.data.message}`);
      } else {
        toast.error("Gagal melakukan ACC data");
      }
    } finally {
      setProcessingAcc(false);
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_sampel_lab?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const StatusBadge = ({ status }) => {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border bg-yellow-100 text-yellow-700 border-yellow-200">
        MENUNGGU VALIDASI
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileCheck className="text-emerald-600" /> Validasi Hasil
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Tinjau dan validasi hasil uji laboratorium sebelum diterbitkan.
          </p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <FileText size={14} /> Menunggu Validasi: {filteredData.length}
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3 bg-gray-50/50">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari Nama, No. Reg, atau ID Lab..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">
                  Tanggal & ID Lab
                </th>
                <th className="px-6 py-4">Informasi Pasien</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin" /> Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400">
                    Tidak ada data yang menunggu validasi.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar size={12} />
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                          )}
                        </div>
                        <span className="font-mono text-sm font-bold text-gray-700">
                          {item.no_reg}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {item.no_sampel_lab || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {item.nama_pasien}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.jenis_pemeriksaan}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenPreview(item.id)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm shadow-emerald-200"
                        >
                          <Eye size={16} /> Review & ACC
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview & ACC */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  Validasi Hasil Uji Laboratorium
                </h3>
                <p className="text-xs text-gray-500">
                  Periksa kesesuaian data sebelum diterbitkan.
                </p>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Info Pasien */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div>
                  <p className="text-xs text-gray-500">Nama Pasien</p>
                  <p className="font-bold text-gray-800">
                    {previewData.nama_pasien}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">No. Registrasi / Lab</p>
                  <p className="font-mono text-sm font-semibold text-emerald-700">
                    {previewData.no_reg} / {previewData.no_sampel_lab}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal Daftar</p>
                  <p className="text-sm font-medium">
                    {new Date(
                      previewData.tgl_daftar || previewData.created_at,
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Row Baru untuk Waktu Pemeriksaan */}
                <div className="pt-2 border-t border-emerald-100/50">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <PlayCircle size={12} className="text-orange-500" /> Waktu
                    Mulai Uji
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {previewData.waktu_mulai_periksa
                      ? new Date(
                          previewData.waktu_mulai_periksa,
                        ).toLocaleString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "-"}
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-100/50">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />{" "}
                    Waktu Selesai Uji
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {previewData.waktu_selesai_periksa
                      ? new Date(
                          previewData.waktu_selesai_periksa,
                        ).toLocaleString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "-"}
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-100/50">
                  <p className="text-xs text-gray-500">Durasi Pengerjaan</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {calculateDuration(
                      previewData.waktu_mulai_periksa,
                      previewData.waktu_selesai_periksa,
                    )}
                  </p>
                </div>
              </div>

              {/* Tabel Hasil */}
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" /> Detail
                Parameter Uji
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Parameter</th>
                      <th className="px-4 py-3 text-center">Hasil</th>
                      <th className="px-4 py-3">Satuan</th>
                      <th className="px-4 py-3">Nilai Rujukan</th>
                      <th className="px-4 py-3">Metode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.tests?.map((test, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">
                          {test.parameter_name}
                        </td>
                        <td className="px-4 py-2 text-center font-bold text-gray-800">
                          {test.nilai}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {test.satuan}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {test.nilai_rujukan}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {test.metode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-emerald-50 flex justify-end gap-3">
              <button
                onClick={() => setPreviewData(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-white transition"
              >
                Tutup
              </button>

              <button
                onClick={handleApprove}
                disabled={processingAcc}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-200 transition flex items-center gap-2 disabled:opacity-70"
              >
                {processingAcc ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> ACC & Terbitkan LHU
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
