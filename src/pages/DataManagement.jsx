// src/pages/DataManagement.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  FileBarChart,
  Printer,
  Download,
  Search,
  Loader2,
  FileText,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import LHUPrintTemplate from "../components/LHUPrintTemplate";
import ResultInputModal from "../components/ResultInputModal"; // Import Modal Edit Hasil
import { useAuth } from "../context/AuthContext";

export default function DataManagement({ onRefreshStats }) {
  const navigate = useNavigate(); // Hook navigasi
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Print
  const [selectedForPrint, setSelectedForPrint] = useState(null);

  // State untuk Preview Modal ACC
  const [previewData, setPreviewData] = useState(null);
  const [processingAcc, setProcessingAcc] = useState(false);

  // State untuk Modal Revisi Hasil
  const [isEditingResult, setIsEditingResult] = useState(false);

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

  // --- REFRESH DATA PREVIEW SETELAH REVISI HASIL ---
  const refreshPreviewData = async () => {
    if (!previewData) return;
    // Tutup modal edit hasil
    setIsEditingResult(false);
    // Reload data preview untuk melihat perubahan angka
    await handleOpenPreview(previewData.id);
    toast.success("Data hasil berhasil diperbarui");
  };

  // --- NAVIGASI KE HALAMAN EDIT PASIEN ---
  const handleEditPatientData = () => {
    if (previewData) {
      // Tutup modal preview
      setPreviewData(null);
      // Arahkan ke halaman edit yang sudah Anda buat
      navigate(`/registrations/edit/${previewData.id}`);
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
        setPreviewData(null);
        fetchData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan ACC data");
    } finally {
      setProcessingAcc(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
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
          render: `Gagal menghapus: ${
            error.response?.data?.message || error.message
          }`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }
  };

  // --- Logic Export Excel (REFACTORED FOR BETTER UX) ---
  const exportToExcel = async () => {
    // 1. Cek Data
    if (filteredData.length === 0) {
      toast.warn("Tidak ada data untuk diexport");
      return;
    }

    const toastId = toast.loading("Menyiapkan format laporan yang rapi...");

    try {
      // 2. Fetch Data Detail (Tests) - Sama seperti sebelumnya
      const enrichedData = await Promise.all(
        filteredData.map(async (item) => {
          try {
            const res = await api.get(`/registrations/${item.id}/tests`);
            const testsData = res.data.success ? res.data.data : [];
            return { ...item, tests: testsData };
          } catch (err) {
            return item;
          }
        }),
      );

      // 3. Persiapan Data Excel & Merging Config
      // Kita akan memisahkan antara baris Header dengan baris Data untuk menghitung koordinat merge
      const rawDataRows = [];
      const merges = [];

      // Header Table (Row index 0 relative to table body)
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

      // Variabel bantu untuk tracking baris saat ini (dimulai dari 0 untuk body tabel)
      let currentRow = 0;
      // Offset baris dari atas sheet (Title + Metadata + Header Table).
      // Title(2) + Spasi(1) + Metadata(4) + Header(1) = 8 baris terpakai di atas.
      // Jadi data mulai di index ke-8 (Excel index based 0)
      const TOP_OFFSET = 8;

      enrichedData.forEach((item, index) => {
        const tests = item.tests && item.tests.length > 0 ? item.tests : [];
        // Jika tidak ada tes, kita anggap 1 baris kosong agar data pasien tetap muncul
        const rowSpan = tests.length > 0 ? tests.length : 1;

        // Data Identitas Pasien (Akan di-merge)
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

        // --- LOGIC PENYUSUNAN BARIS ---
        if (tests.length > 0) {
          tests.forEach((tes, testIndex) => {
            // Baris pertama: Tampilkan Info Pasien + Hasil Tes Pertama
            // Baris selanjutnya: Info Pasien KOSONG (karena akan di-merge) + Hasil Tes Selanjutnya
            const rowData = [
              ...(testIndex === 0 ? patientInfo : Array(13).fill("")), // 13 adalah jumlah kolom identitas
              tes.nama_pemeriksaan || tes.parameter_name,
              tes.nilai || tes.result || "Belum ada",
              tes.satuan || "-",
              tes.nilai_rujukan || "-",
              tes.metode || "-",
            ];
            rawDataRows.push(rowData);
          });
        } else {
          // Fallback jika tidak ada tes (tetap tampilkan pasien)
          rawDataRows.push([
            ...patientInfo,
            item.jenis_pemeriksaan,
            "-",
            "-",
            "-",
            "-",
          ]);
        }

        // --- LOGIC MERGING (UX ENHANCEMENT) ---
        // Kita hanya melakukan merge jika rowSpan > 1 (artinya tes lebih dari 1)
        if (rowSpan > 1) {
          // Loop untuk kolom 0 s/d 12 (Kolom Identitas Pasien)
          for (let col = 0; col <= 12; col++) {
            merges.push({
              s: { r: TOP_OFFSET + currentRow, c: col }, // Start Cell
              e: { r: TOP_OFFSET + currentRow + rowSpan - 1, c: col }, // End Cell
            });
          }
        }

        // Update tracking baris
        currentRow += rowSpan;
      });

      // 4. Final Array Assembly
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
        [""], // Spasi sebelum header
      ];

      // Gabungkan semua komponen
      const finalData = [
        ...reportTitle,
        ...reportSubtitle,
        ...metadata,
        headers, // Row index 7 (TOP_OFFSET - 1)
        ...rawDataRows, // Row index 8 (TOP_OFFSET) starts here
      ];

      // 5. Create Worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(finalData);

      // Terapkan Merge untuk Identitas Pasien (UX Core)
      // Jangan lupa merge Header Judul Laporan juga
      const headerMerges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Merge Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Merge Subtitle
      ];

      worksheet["!merges"] = [...headerMerges, ...merges];

      // 6. Auto Width Calculation (Agar tulisan tidak terpotong)
      const colWidths = headers.map((header, colIndex) => {
        let maxLength = header.length;
        // Sampling lebar kolom berdasarkan isi data (max 50 baris pertama biar cepet)
        for (let i = 0; i < Math.min(rawDataRows.length, 50); i++) {
          // Cek baris yang ada isinya (karena row 2 dst kosong akibat logic merge di atas)
          // Kita harus cari row yang tidak kosong di kolom tersebut, atau ambil estimasi rata-rata
          // Namun karena kita pakai merge, row bawahnya string kosong "".
          // Jadi logika width ini akan ambil max dari header atau row yang ada isinya.
          const cellValue = rawDataRows[i][colIndex]
            ? String(rawDataRows[i][colIndex])
            : "";
          if (cellValue.length > maxLength) maxLength = cellValue.length;
        }
        return { wch: maxLength + 4 }; // +4 buffer padding
      });
      worksheet["!cols"] = colWidths;

      // 7. Write File
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan LIMS");
      const fileName = `Laporan_LIMS_Clean_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(workbook, fileName);

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

      // DEBUG: Cek data validator yang diterima
      console.log("Data untuk print LHU:", {
        id: regData.id,
        no_reg: regData.no_reg,
        validator: regData.validator,
        validator_field_exists: "validator" in regData,
        all_fields: Object.keys(regData),
      });

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

  const filteredData = data.filter(
    (item) =>
      item.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.no_sampel_lab?.toLowerCase().includes(searchTerm.toLowerCase()),
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
                    {/* Di dalam mapping data, ganti kolom aksi menjadi: */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {item.status === "selesai" ? (
                          <button
                            onClick={() => handlePrintLHU(item.id)}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center gap-1 shadow-sm shadow-purple-200"
                          >
                            <Printer size={14} /> Cetak LHU
                          </button>
                        ) : (
                          <span className="text-gray-400 italic text-[10px] bg-gray-100 px-2 py-1 rounded">
                            {item.status === "selesai_uji"
                              ? "Menunggu Validasi"
                              : "Belum Selesai"}
                          </span>
                        )}

                        {/* Hapus tombol Review & ACC untuk status selesai_uji */}

                        {/* Tombol edit/hapus untuk manajemen (opsional tetap ada) */}
                        {user?.role === "manajemen" && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/registrations/edit/${item.id}`)
                              }
                              className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition"
                              title="Edit Data Pasien"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                              title="Hapus Data"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
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

      {/* --- MODAL EDIT HASIL (RE-USE EXISTING COMPONENT) --- */}
      {isEditingResult && previewData && (
        <ResultInputModal
          registrationId={previewData.id}
          noSampel={previewData.no_sampel_lab}
          onClose={refreshPreviewData} // Saat ditutup, refresh data preview
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
