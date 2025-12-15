import React from "react";
import {
  ArrowLeft,
  Printer,
  User,
  FileText,
  Calendar,
  MapPin,
  Activity,
  TestTube2,
  Phone,
} from "lucide-react";

export default function RegistrationDetail({ data, onBack }) {
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Komponen Helper untuk Item Data
  const DetailItem = ({ label, value, icon: Icon, className = "" }) => (
    <div
      className={`flex flex-col gap-1 mb-4 print:mb-2 print:border-b print:border-gray-200 print:pb-1 ${className}`}
    >
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 print:text-gray-600 print:text-[10px]">
        {/* Icon disembunyikan saat print agar lebih bersih */}
        <span className="print:hidden">{Icon && <Icon size={12} />}</span>
        {label}
      </span>
      <span className="text-gray-800 font-medium text-sm break-words print:text-black print:text-xs">
        {value || "-"}
      </span>
    </div>
  );

  return (
    // CLASS PENTING: print:fixed print:inset-0 print:z-[9999]
    // Ini memaksa komponen ini menutupi seluruh halaman (termasuk sidebar) saat diprint
    <div className="space-y-6 animate-fade-in print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-8 print:m-0 print:h-screen print:overflow-auto">
      {/* --- Header Actions (Tombol Kembali & Print) - Hilang saat Print --- */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition font-medium"
        >
          <div className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
            <ArrowLeft size={18} />
          </div>
          Kembali ke List
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg shadow-gray-200"
        >
          <Printer size={18} /> Cetak Dokumen
        </button>
      </div>

      {/* --- KOP SURAT KHUSUS PRINT (Hanya Muncul Saat Print) --- */}
      <div className="hidden print:flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
        <div className="text-left space-y-1">
          <h1 className="text-xl font-bold uppercase text-gray-900 leading-none">
            Kementerian Kesehatan RI
          </h1>
          <h2 className="text-lg font-bold uppercase text-gray-800 leading-none">
            Balai Besar Labkesmas Banda Aceh
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Jl. Syech Abdurrauf, Kota Banda Aceh, Aceh <br />
            Telp: (0651) 123456 | Email: info@bblkm-aceh.id
          </p>
        </div>
        {/* Logo diletakkan di kanan atas sesuai request */}
        <div className="flex items-center">
          {/* Menggunakan path logo.svg atau fallback text jika gambar gagal load */}
          <img
            src="/logo.svg"
            alt="Logo Kemenkes"
            className="h-16 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }} // Fallback jika logo 404
          />
          {/* Fallback visual jika image tidak ada */}
          <div className="h-16 w-16 bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] text-center p-1 rounded hidden first:block">
            Logo Disini
          </div>
        </div>
      </div>

      {/* Judul Dokumen Print */}
      <div className="hidden print:block text-center mb-6">
        <h3 className="text-lg font-bold text-black underline decoration-2 underline-offset-4">
          LEMBAR REGISTRASI SAMPEL
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Dicetak pada:{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* --- Main Card Content --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Status Header (Tampilan Web Modern vs Print Minimalis) */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white print:bg-none print:p-0 print:text-black print:mb-6 print:border-2 print:border-gray-200 print:rounded-lg print:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cyan-100 text-sm font-medium mb-1 print:text-gray-500 print:text-xs print:uppercase print:tracking-widest">
                Nomor Registrasi
              </p>
              {/* Menggunakan ID dari screenshot referensi sebagai style guide */}
              <h1 className="text-3xl font-bold tracking-tight print:text-2xl print:font-mono">
                {data.no_reg}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-cyan-50 print:text-gray-700 print:mt-0">
                <TestTube2 size={16} className="print:hidden" />
                <span className="font-mono text-sm opacity-90">
                  ID Lab: {data.no_sampel_lab}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 print:border-black print:bg-transparent print:rounded-md print:border-2">
              <span className="font-bold uppercase tracking-wide text-sm print:text-black">
                {data.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8 print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-8">
            {/* Kolom 1: Data Pasien */}
            <div className="space-y-4 print:space-y-0">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4 print:border-black print:mb-2">
                <User className="text-cyan-600 print:hidden" size={20} />
                <h3 className="font-bold text-gray-800 print:text-black print:uppercase print:text-sm">
                  Identitas Pasien
                </h3>
              </div>

              {/* Layout Grid Kecil untuk Print agar hemat tempat */}
              <div className="print:grid print:grid-cols-2 print:gap-x-4">
                <DetailItem
                  label="Nama Lengkap"
                  value={data.nama_pasien}
                  className="print:col-span-2"
                />
                <DetailItem label="NIK" value={data.nik} />
                <DetailItem label="Umur" value={`${data.umur} Tahun`} />
                <DetailItem
                  label="Jenis Kelamin"
                  value={data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                />
                <DetailItem
                  label="Tgl Lahir"
                  value={formatDate(data.tgl_lahir)}
                  icon={Calendar}
                />
                <DetailItem
                  label="Kontak / HP"
                  value={data.no_kontak}
                  icon={Phone}
                />
                <DetailItem
                  label="Alamat"
                  value={data.alamat}
                  icon={MapPin}
                  className="print:col-span-2"
                />
              </div>
            </div>

            {/* Kolom 2: Data Sampel */}
            <div className="space-y-4 print:space-y-0">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4 print:border-black print:mb-2">
                <Activity className="text-cyan-600 print:hidden" size={20} />
                <h3 className="font-bold text-gray-800 print:text-black print:uppercase print:text-sm">
                  Data Pemeriksaan
                </h3>
              </div>

              <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 mb-4 print:bg-transparent print:border-0 print:p-0 print:mb-0">
                <DetailItem
                  label="Jenis Pemeriksaan"
                  value={data.jenis_pemeriksaan}
                  className="print:mb-2"
                />
              </div>

              <div className="print:grid print:grid-cols-2 print:gap-x-4">
                <DetailItem label="Asal Sampel" value={data.asal_sampel} />
                <DetailItem
                  label="No. Sampel Asal"
                  value={data.no_sampel_asal}
                />
                <DetailItem label="Coding / Kode" value={data.coding} />
                <DetailItem label="Form PE" value={data.form_pe} />
                <DetailItem
                  label="Tgl Terima"
                  value={formatDate(data.tgl_terima)}
                  icon={Calendar}
                />
                <DetailItem
                  label="Tgl Pengambilan"
                  value={formatDate(data.tgl_pengambilan)}
                  icon={Calendar}
                />
              </div>

              {/* Footer Keterangan */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 print:border-gray-400 print:mt-2 print:pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="Ket. Pengerjaan"
                    value={data.ket_pengerjaan}
                  />
                  <DetailItem
                    label="Ket. Pengiriman"
                    value={data.ket_pengiriman}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Tanda Tangan (Hanya muncul di Print) */}
          <div className="hidden print:flex mt-12 pt-8 justify-between px-8 text-center text-xs text-black">
            <div>
              <p className="mb-16">Pengirim / Pasien</p>
              <p className="font-bold underline">
                ({data.nama_pasien || ".........................."})
              </p>
            </div>
            <div>
              <p className="mb-16">Petugas Penerima</p>
              <p className="font-bold underline">
                ({data.petugas_input || "Admin Labkesmas"})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
