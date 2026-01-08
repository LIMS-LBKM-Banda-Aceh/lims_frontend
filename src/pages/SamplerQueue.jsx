import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Syringe,
  Clock,
  CheckCircle2,
  PlayCircle,
  Send,
  AlertCircle,
} from "lucide-react";

export default function SamplerQueue({ onRefreshStats }) {
  const [activeTab, setActiveTab] = useState("queue"); // 'queue' (Terdaftar) or 'process' (Proses Sampling)
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data: Ambil semua yang statusnya 'terdaftar' atau 'proses_sampling'
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations");
      if (res.data.success) {
        // Filter hanya yang relevan untuk page ini
        const relevantData = res.data.data.filter((item) =>
          ["terdaftar", "proses_sampling"].includes(item.status)
        );
        setDataList(relevantData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat antrian sampler");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tahap 1: Mulai Sampling (Terdaftar -> Proses Sampling)
  const handleStartSampling = async (id, noReg) => {
    try {
      await api.put(`/registrations/${id}/start-sampling`);
      toast.info(`Mulai pengambilan sampel: ${noReg}`);
      fetchData();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      toast.error("Gagal memulai proses");
    }
  };

  // Tahap 2: Kirim ke Lab (Proses Sampling -> Diterima Lab)
  const handleSendToLab = async (id, noReg) => {
    if (
      !confirm(
        `Selesai mengambil sampel ${noReg}? Data akan diteruskan ke Laboratorium.`
      )
    )
      return;

    try {
      await api.put(`/registrations/${id}/send-to-lab`); // Pastikan route ini sesuai di backend
      toast.success(`Sampel ${noReg} berhasil dikirim ke Lab!`);
      fetchData();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      toast.error("Gagal mengirim ke lab");
    }
  };

  // Filter data berdasarkan Tab Aktif
  const filteredData = dataList.filter((item) => {
    if (activeTab === "queue") return item.status === "terdaftar";
    if (activeTab === "process") return item.status === "proses_sampling";
    return false;
  });

  const getCounts = (status) =>
    dataList.filter((i) => i.status === status).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Syringe className="text-cyan-600" /> Ruang Sampling
          </h2>
          <p className="text-gray-500 text-sm">
            Manajemen pengambilan sampel fisik pasien.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="text-cyan-600 text-sm font-medium hover:underline self-end md:self-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "queue"
              ? "border-cyan-600 text-cyan-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock size={16} />
          Antrian Baru
          <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {getCounts("terdaftar")}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("process")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "process"
              ? "border-yellow-500 text-yellow-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Syringe size={16} />
          Sedang Sampling
          <span className="ml-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">
            {getCounts("proses_sampling")}
          </span>
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">No. Registrasi</th>
              <th className="px-6 py-4">Identitas Pasien</th>
              <th className="px-6 py-4">Item Pemeriksaan</th>
              <th className="px-6 py-4">Waktu</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="text-gray-300" size={32} />
                    <p className="text-gray-500 font-medium">
                      Tidak ada data pada tab ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-cyan-50/30 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {item.no_reg}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Lab ID: {item.no_sampel_lab}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {item.nama_pasien}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.umur} Th • {item.jenis_kelamin}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p
                      className="truncate text-gray-600"
                      title={item.jenis_pemeriksaan}
                    >
                      {item.jenis_pemeriksaan}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Daftar:{" "}
                        {new Date(item.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {item.waktu_sampling && (
                        <span className="flex items-center gap-1 text-yellow-600 font-medium">
                          <Syringe size={12} />
                          Sampling: {item.waktu_sampling?.slice(0, 5) || "-"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* LOGIKA TOMBOL BERDASARKAN STATUS */}
                    {item.status === "terdaftar" ? (
                      <button
                        onClick={() =>
                          handleStartSampling(item.id, item.no_reg)
                        }
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-cyan-700 hover:shadow-md transition-all flex items-center gap-2 mx-auto"
                      >
                        <PlayCircle size={16} /> Proses Sampel
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleSendToLab(item.id, item.no_reg)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 hover:shadow-md transition-all flex items-center gap-2"
                        >
                          <Send size={16} /> Kirim ke Lab
                        </button>
                        <span className="text-[10px] text-orange-500 font-medium flex items-center gap-1">
                          <AlertCircle size={10} /> Konfirmasi akhir
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
