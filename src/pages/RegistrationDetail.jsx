// pages/RegistrationDetail.jsx
import React from "react";
import {
  ArrowLeft,
  Printer,
  User,
  Calendar,
  MapPin,
  Activity,
  TestTube2,
  Phone,
  CreditCard,
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

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  // Helper untuk memparsing string jenis_pemeriksaan jika masih format lama (comma separated)
  // Di sistem baru, idealnya kita fetch details array.
  // Untuk display cepat, kita asumsikan jenis_pemeriksaan berisi nama layanan.
  // Jika ingin menampilkan tabel harga detail di print, backend harus mengirim array `details`.
  // Kode di bawah ini adalah fallback UI jika `details` belum ada.
  const renderItemTable = () => {
    // Jika ada data details dari backend (versi update)
    if (data.details && data.details.length > 0) {
      return (
        <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left">
                Nama Pemeriksaan
              </th>
              <th className="border border-gray-300 px-2 py-1 text-right">
                Biaya
              </th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((detail, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 px-2 py-1">
                  {detail.nama_pemeriksaan || "Item Pemeriksaan"}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatRupiah(detail.harga_saat_ini)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td className="border border-gray-300 px-2 py-1 text-right">
                TOTAL
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {formatRupiah(data.total_biaya)}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    // Fallback jika belum ada details array (Hanya summary string)
    return (
      <div className="border border-gray-200 rounded p-3 bg-gray-50">
        <p className="text-sm font-medium">{data.jenis_pemeriksaan}</p>
        <hr className="my-2 border-gray-200" />
        <div className="flex justify-between font-bold text-sm">
          <span>Total Estimasi Biaya</span>
          <span>{formatRupiah(data.total_biaya)}</span>
        </div>
      </div>
    );
  };

  const DetailItem = ({ label, value, icon: Icon, className = "" }) => (
    <div
      className={`flex flex-col gap-1 mb-4 print:mb-2 print:pb-1 ${className}`}
    >
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 print:text-gray-600 print:text-[10px]">
        <span className="print:hidden">{Icon && <Icon size={12} />}</span>
        {label}
      </span>
      <span className="text-gray-800 font-medium text-sm break-words print:text-black print:text-xs">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-8 print:m-0 print:h-screen print:overflow-auto">
      {/* Tombol Navigasi (Hilang saat Print) */}
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
          <Printer size={18} /> Cetak Bukti Registrasi
        </button>
      </div>

      {/* KOP SURAT (Hanya Print) */}
      <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div className="text-left space-y-1">
          <h1 className="text-xl font-bold uppercase text-black leading-none">
            Kementerian Kesehatan RI
          </h1>
          <h2 className="text-lg font-bold uppercase text-black leading-none">
            Balai Besar Labkesmas Banda Aceh
          </h2>
          <p className="text-xs text-black mt-1">
            Jl. Bandara SIM Blang Bintang Lr. Biomedis No. 9,
            <br />
            Kecamatan Ingin Jaya Kabupaten Aceh Besar Provinsi Aceh <br />
            Kode Pos 23317 <br />
            Telepon: 0651-8070189
            <br /> Whatsapp: 0811-6107-253 <br />
            E-mail: labkesmasaceh@kemkes.go.id
          </p>
        </div>
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-16 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Judul Print */}
      <div className="hidden print:block text-center mb-6">
        <h3 className="text-lg font-bold text-black underline decoration-2 underline-offset-4">
          BUKTI REGISTRASI SAMPEL
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

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Header Warna (Hilang di print, ganti border simple) */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white print:bg-none print:p-0 print:text-black print:mb-4 print:border-b print:border-dashed print:pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cyan-100 text-sm font-medium mb-1 print:text-gray-500 print:text-xs print:uppercase">
                Nomor Registrasi
              </p>
              <h1 className="text-3xl font-bold tracking-tight print:text-xl print:font-mono">
                {data.no_reg}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-cyan-50 print:text-gray-700 print:mt-1">
                <TestTube2 size={16} className="print:hidden" />
                <span className="font-mono text-sm opacity-90">
                  ID Lab: {data.no_sampel_lab}
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 print:border-2 print:border-black print:bg-transparent print:rounded-md">
              <span className="font-bold uppercase tracking-wide text-sm print:text-black">
                {data.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-4 print:grid-cols-2">
            {/* Kiri: Identitas */}
            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4 print:border-black print:mb-2">
                <User className="text-cyan-600 print:hidden" size={20} />
                <h3 className="font-bold text-gray-800 print:text-black print:text-sm print:uppercase">
                  Identitas Pasien
                </h3>
              </div>
              <div className="print:text-xs space-y-2">
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Nama</span>
                  <span className="col-span-2 font-bold">
                    {data.nama_pasien}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">NIK</span>
                  <span className="col-span-2">{data.nik}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Umur/JK</span>
                  <span className="col-span-2">
                    {data.umur} Th / {data.jenis_kelamin}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Tgl Lahir</span>
                  <span className="col-span-2">
                    {formatDate(data.tgl_lahir)}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Alamat</span>
                  <span className="col-span-2">{data.alamat}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Kontak</span>
                  <span className="col-span-2">{data.no_kontak}</span>
                </div>
              </div>
            </div>

            {/* Kanan: Sampel & Layanan */}
            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4 print:border-black print:mb-2">
                <Activity className="text-cyan-600 print:hidden" size={20} />
                <h3 className="font-bold text-gray-800 print:text-black print:text-sm print:uppercase">
                  Info Sampel
                </h3>
              </div>
              <div className="print:text-xs space-y-2 mb-4">
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Asal</span>
                  <span className="col-span-2">{data.asal_sampel}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Tgl Terima</span>
                  <span className="col-span-2">
                    {formatDate(data.tgl_terima)}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Form PE</span>
                  <span className="col-span-2">{data.form_pe || "-"}</span>
                </div>
              </div>

              {/* Tabel Rincian Keuangan */}
              <div className="print:mt-4">
                <div className="flex items-center gap-2 mb-2 print:hidden">
                  <CreditCard size={16} className="text-cyan-600" />
                  <span className="font-bold text-gray-800">Rincian Biaya</span>
                </div>
                {renderItemTable()}
              </div>
            </div>
          </div>

          {/* Footer Tanda Tangan */}
          <div className="hidden print:flex mt-12 pt-8 justify-between px-8 text-center text-xs text-black">
            <div>
              <p className="mb-12">Pasien / Pengirim</p>
              <p className="font-bold underline">
                ({data.nama_pasien || ".........................."})
              </p>
            </div>
            <div>
              <p className="mb-12">Petugas Administrasi</p>
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
