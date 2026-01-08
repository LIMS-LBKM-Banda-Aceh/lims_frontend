// src/pages/DataManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  FileBarChart,
  Printer,
  Download,
  Search,
  Loader2,
  CheckCircle2,
  FileText,
  Calendar,
  X, // Icon Close
  Eye, // Icon Preview
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import LHUPrintTemplate from "../components/LHUPrintTemplate";

// 1. TAMBAHKAN PROPS DISINI
export default function DataManagement({ onRefreshStats }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Print
  const [selectedForPrint, setSelectedForPrint] = useState(null);

  // State Baru untuk Preview Modal ACC
  const [previewData, setPreviewData] = useState(null);
  const [processingAcc, setProcessingAcc] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/registrations");
      if (res.data.success) {
        // Sort data terbaru di atas
        const sortedData = res.data.data.sort((a, b) => b.id - a.id);
        setData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  // --- BUKA MODAL PREVIEW ---
  const handleOpenPreview = async (id) => {
    const toastId = toast.loading("Memuat rincian hasil...");
    try {
      // 1. Ambil Data Registrasi
      const regRes = await api.get(`/registrations/${id}`);
      // 2. Ambil Data Test Result
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

  // --- EKSEKUSI ACC (FINALIZE) ---
  const handleApprove = async () => {
    if (!previewData) return;

    setProcessingAcc(true);
    try {
      const res = await api.put(`/registrations/${previewData.id}/finalize`);
      if (res.data.success) {
        toast.success("Data berhasil di-ACC. LHU siap dicetak.");
        setPreviewData(null); // Tutup Modal

        // 2. REFRESH TABEL LOKAL
        fetchData();

        // 3. REFRESH DASHBOARD STATS (PENTING AGAR REALTIME)
        if (onRefreshStats) onRefreshStats();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan ACC data");
    } finally {
      setProcessingAcc(false);
    }
  };

  // --- Logic Export Excel ---
  const exportToExcel = () => {
    if (data.length === 0) {
      toast.warn("Tidak ada data untuk diexport");
      return;
    }

    const dataToExport = filteredData.map((item) => ({
      "No. Registrasi": item.no_reg,
      "No. Sampel Lab": item.no_sampel_lab,
      "Tanggal Terima": new Date(item.tgl_terima).toLocaleDateString("id-ID"),
      "Jam Terima": item.waktu_sampling,
      "Nama Pasien": item.nama_pasien,
      NIK: item.nik,
      "Jenis Kelamin": item.jenis_kelamin,
      "Jenis Pemeriksaan": item.jenis_pemeriksaan,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan LIMS");

    const wscols = Object.keys(dataToExport[0]).map(() => ({ wch: 20 }));
    worksheet["!cols"] = wscols;

    XLSX.writeFile(
      workbook,
      `Laporan_LIMS_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    toast.success("Data berhasil diexport.");
  };

  // --- Logic Print LHU ---
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
        // setSelectedForPrint(null); // Optional: close print view after print
      }, 800);
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: "Gagal memuat data print",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // --- Filter Logic ---
  const filteredData = data.filter(
    (item) =>
      item.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_sampel_lab?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileBarChart className="text-cyan-600" /> Manajemen Data & Laporan
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Validasi hasil uji lab dan cetak Laporan Hasil Uji (LHU).
          </p>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3 bg-gray-50/50">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari Nama, No. Reg, atau ID Lab..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium ml-auto">
            <FileText size={14} /> Total Data: {filteredData.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Tanggal & ID</th>
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
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-cyan-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar size={12} />
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID"
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
                        {/* --- LOGIC TOMBOL UTAMA --- */}
                        {item.status === "selesai_uji" ? (
                          <button
                            onClick={() => handleOpenPreview(item.id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-sm shadow-blue-200"
                          >
                            <Eye size={14} /> Review & ACC
                          </button>
                        ) : item.status === "selesai" ? (
                          <button
                            onClick={() => handlePrintLHU(item.id)}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center gap-1 shadow-sm shadow-purple-200"
                          >
                            <Printer size={14} /> Cetak LHU
                          </button>
                        ) : (
                          <span className="text-gray-400 italic text-[10px] bg-gray-100 px-2 py-1 rounded">
                            Menunggu Analis
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center print:hidden">
          <span>Menampilkan {filteredData.length} baris data</span>
        </div>
      </div>

      {/* --- MODAL PREVIEW & ACC --- */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  Review Hasil Uji Laboratorium
                </h3>
                <p className="text-xs text-gray-500">
                  Pastikan data valid sebelum menerbitkan LHU.
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
              <div className="grid grid-cols-2 gap-4 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500">Nama Pasien</p>
                  <p className="font-bold text-gray-800">
                    {previewData.nama_pasien}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">No. Registrasi / Lab</p>
                  <p className="font-mono text-sm font-semibold">
                    {previewData.no_reg} / {previewData.no_sampel_lab}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal Terima</p>
                  <p className="text-sm">
                    {new Date(previewData.tgl_terima).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Asal Sampel</p>
                  <p className="text-sm">{previewData.asal_sampel}</p>
                </div>
              </div>

              {/* Tabel Hasil */}
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-cyan-600" /> Detail
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

            {/* Modal Footer (Action Buttons) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setPreviewData(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-white transition"
              >
                Batal / Cek Lagi
              </button>

              <button
                onClick={handleApprove}
                disabled={processingAcc}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-200 transition flex items-center gap-2 disabled:opacity-70"
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

      {/* Component Cetak Hidden */}
      {selectedForPrint && (
        <div className="hidden print:block fixed inset-0 bg-white z-9999">
          <LHUPrintTemplate data={selectedForPrint} />
        </div>
      )}
    </div>
  );
}
