import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import ResultInputModal from "../components/ResultInputModal";

export default function LabQueue({ onRefreshStats }) {
  const [activeTab, setActiveTab] = useState("waiting"); // 'waiting' (Diterima Lab) or 'process' (Proses Lab)
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations/lab-queue");
      if (res.data.success) {
        // Kita simpan semua data, nanti difilter berdasarkan Tab
        setQueue(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat antrian lab");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

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

  // Filter Data Berdasarkan Tab
  const filteredData = queue.filter((item) => {
    if (activeTab === "waiting") return item.status === "diterima_lab";
    if (activeTab === "process") return item.status === "proses_lab";
    return false;
  });

  const getCounts = (status) => queue.filter((i) => i.status === status).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FlaskConical className="text-cyan-600" /> Ruang Laboratorium
          </h2>
          <p className="text-gray-500 text-sm">
            Manajemen pengerjaan sampel dan input hasil pemeriksaan.
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="text-cyan-600 text-sm font-medium hover:underline self-end md:self-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("waiting")}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "waiting"
              ? "border-cyan-600 text-cyan-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package size={16} />
          Menunggu Proses
          <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {getCounts("diterima_lab")}
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
          <FlaskConical size={16} />
          Sedang Diuji
          <span className="ml-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">
            {getCounts("proses_lab")}
          </span>
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">ID Sampel (Lab)</th>
              <th className="px-6 py-4">Waktu</th>
              <th className="px-6 py-4">Parameter Pemeriksaan</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-gray-400">
                  Memuat antrian...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="text-gray-300" size={32} />
                    <p className="text-gray-500 font-medium">
                      Tidak ada sampel pada tahap ini.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-cyan-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {item.no_sampel_lab}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Reg: {item.no_reg}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 font-medium text-gray-700">
                        <Clock size={14} className="text-cyan-600" />{" "}
                        {item.waktu_sampling?.slice(0, 5) || "00:00"} WIB
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize">
                        {new Date(item.tgl_terima).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
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
                      <span className="text-[10px] text-orange-500 flex items-center gap-1 mt-1">
                        <AlertCircle size={10} /> {item.catatan_tambahan}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {/* BUTTON ACTIONS BERDASARKAN TAB */}
                    {activeTab === "waiting" ? (
                      <button
                        onClick={() =>
                          handleStartProcess(item.id, item.no_sampel_lab)
                        }
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 hover:shadow-md transition-all flex items-center gap-2 mx-auto"
                      >
                        <PlayCircle size={16} /> Mulai Analisis
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedSample(item)}
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-cyan-700 hover:shadow-md transition-all flex items-center gap-2 mx-auto"
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
