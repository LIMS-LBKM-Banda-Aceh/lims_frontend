import React from "react";
import { ArrowLeft, Printer, FileText, User, Calendar } from "lucide-react";

export default function RegistrationDetail({ data, onBack }) {
  if (!data) return null;

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper untuk baris data
  const DetailRow = ({ label, value }) => (
    <div className="flex flex-col border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-gray-900 font-medium mt-1">{value || "-"}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header / Toolbar */}
      <div className="bg-primary p-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-cyan-400 rounded-full hover:bg-blue-800 transition"
            title="Kembali"
          >
            <ArrowLeft className="" size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">Detail Registrasi</h2>
            <p className="text-blue-100 text-sm">
              No. Reg: {data.no_reg} | Lab: {data.no_sampel_lab}
            </p>
          </div>
        </div>

        {/* Status Badge Besar */}
        <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
          <span className="font-bold uppercase tracking-wide text-sm">
            Status: {data.status}
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Kiri: Identitas Pasien */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-blue-400 border-b border-gray-200 pb-2">
            <User size={20} />
            <h3 className="font-bold text-lg">Identitas Pasien</h3>
          </div>

          <div className="space-y-1">
            <DetailRow label="Nama Pasien" value={data.nama_pasien} />
            <DetailRow label="NIK" value={data.nik} />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Tgl Lahir" value={formatDate(data.tgl_lahir)} />
              <DetailRow label="Umur" value={`${data.umur} Tahun`} />
            </div>
            <DetailRow
              label="Jenis Kelamin"
              value={data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
            />
            <DetailRow label="No. Kontak" value={data.no_kontak} />
            <DetailRow label="Alamat" value={data.alamat} />
          </div>
        </div>

        {/* Kolom Kanan: Data Sampel */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-cyan-700 border-b border-gray-200 pb-2">
            <FileText size={20} />
            <h3 className="font-bold text-lg">Data Sampel & Pemeriksaan</h3>
          </div>

          <div className="space-y-1">
            <DetailRow
              label="Jenis Pemeriksaan"
              value={data.jenis_pemeriksaan}
            />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Asal Sampel" value={data.asal_sampel} />
              <DetailRow label="No. Sampel Asal" value={data.no_sampel_asal} />
            </div>
            <DetailRow label="Coding / Kode Ins" value={data.coding} />

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow
                  label="Tgl Terima"
                  value={formatDate(data.tgl_terima)}
                />
                <DetailRow
                  label="Tgl Pengambilan"
                  value={formatDate(data.tgl_pengambilan)}
                />
              </div>
            </div>

            <DetailRow
              label="Keterangan Pengerjaan"
              value={data.ket_pengerjaan}
            />
            <DetailRow
              label="Keterangan Pengiriman"
              value={data.ket_pengiriman}
            />
            <DetailRow label="Form PE" value={data.form_pe} />
            <DetailRow label="Petugas Input" value={data.petugas_input} />
          </div>
        </div>
      </div>

      {/* Footer Actions (Contoh untuk print) */}
      <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          <Printer size={16} /> Cetak Halaman
        </button>
      </div>
    </div>
  );
}
