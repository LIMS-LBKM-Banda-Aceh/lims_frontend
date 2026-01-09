// pages/RegistrationDetail.jsx

import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

import {
  ArrowLeft,
  Printer,
  User,
  Activity,
  CreditCard,
  Save,
  Edit2,
} from "lucide-react";

export default function RegistrationDetail({ data, onBack }) {
  const [isEditingNo, setIsEditingNo] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const { user: currentUser } = useAuth();

  // Set default template jika no_invoice masih kosong
  useEffect(() => {
    if (data) {
      const year = new Date().getFullYear();
      setInvoiceNo(data.no_invoice || ` / 690798 / PNBP / ${year}`);
    }
  }, [data]);

  if (!data) return null;

  const handleSaveInvoice = async () => {
    setLoadingSave(true);
    try {
      await api.put(`/registrations/${data.id}`, { no_invoice: invoiceNo });
      toast.success("Nomor Invoice diperbarui");
      setIsEditingNo(false);
      // Update data lokal agar tampilan sinkron
      data.no_invoice = invoiceNo;
    } catch (error) {
      console.error("Gagal memperbarui nomor:", error);
      toast.error("Gagal menyimpan nomor");
    } finally {
      setLoadingSave(false);
    }
  };

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

  // Logic Render Tabel Biaya (Handle Gratis/Berbayar)
  const renderItemTable = () => {
    const details = data.details || [];
    const isGratis = data.status_pembayaran === "gratis";

    if (details.length === 0) {
      return (
        <div className="border border-gray-200 rounded p-3 bg-gray-50">
          <p className="text-sm font-medium">{data.jenis_pemeriksaan}</p>
          <hr className="my-2 border-gray-200" />
          <div className="flex justify-between font-bold text-sm">
            <span>Total Biaya</span>
            {isGratis ? (
              <span className="text-green-600">GRATIS (Rp 0)</span>
            ) : (
              <span>{formatRupiah(data.total_biaya)}</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-2 py-1 text-left">
              Nama Pemeriksaan
            </th>
            <th className="border border-gray-300 px-2 py-1 text-right w-32">
              Biaya
            </th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 px-2 py-1">
                {detail.nama_pemeriksaan || "Item Pemeriksaan"}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right text-gray-600">
                {formatRupiah(detail.harga_saat_ini)}
              </td>
            </tr>
          ))}

          {isGratis ? (
            <>
              <tr className="bg-green-50 text-green-700 italic">
                <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                  Diskon / Subsidi Program
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  -{" "}
                  {formatRupiah(
                    details.reduce(
                      (sum, item) => sum + Number(item.harga_saat_ini),
                      0
                    )
                  )}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-2 py-1 text-right">
                  TOTAL YANG HARUS DIBAYAR
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right text-black">
                  Rp 0
                </td>
              </tr>
            </>
          ) : (
            <tr className="bg-gray-50 font-bold">
              <td className="border border-gray-300 px-2 py-1 text-right">
                TOTAL
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {formatRupiah(data.total_biaya)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-8 print:m-0 print:h-screen print:overflow-auto">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition font-medium"
        >
          <div className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
            <ArrowLeft size={18} />
          </div>
          Kembali ke List
        </button>

        <div className="flex gap-2">
          {/* INPUT NOMOR INVOICE UNTUK KASIR/ADMIN */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1 shadow-sm">
            <span className="text-xs font-bold text-gray-400 mr-2 uppercase">
              No Invoice:
            </span>
            {isEditingNo ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  className="border-b border-cyan-500 outline-none text-sm font-bold w-48 px-1"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleSaveInvoice}
                  disabled={loadingSave}
                  className="text-green-600 p-1 hover:bg-green-50 rounded"
                >
                  {loadingSave ? "..." : <Save size={16} />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  {invoiceNo || "-"}
                </span>
                <button
                  onClick={() => setIsEditingNo(true)}
                  className="text-cyan-600 p-1 hover:bg-cyan-50 rounded"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => globalThis.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
          >
            <Printer size={18} /> Cetak Bukti
          </button>
        </div>
      </div>

      {/* --- KOP SURAT (PRINT VIEW) --- */}
      {/* KOP SURAT (Hanya Print) */}
      <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <img
          src="/src/assets/kop_mail.png"
          alt="Logo"
          className="w-auto object-contain"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      {/* JUDUL PRINT DENGAN NOMOR INVOICE */}
      <div className="hidden print:block text-center mb-6">
        <h3 className="text-lg font-extrabold text-black underline-offset-4">
          INVOICE LAYANAN PNBP 
          <br />
          BALAI LABORATORIUM KESEHATAN MASYARAKAT BANDA ACEH
        </h3>
        <p className="text-sm font-bold mt-1">Nomor : {invoiceNo}</p>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        <div className="bg-linear-to-r from-cyan-600 to-blue-600 p-8 text-white print:text-black print:bg-none print:p-0 print:border-b print:pb-4 print:mb-4">
          {/* Tampilkan juga No Invoice di Header Biru (Non-Print) */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cyan-100 text-xs font-bold uppercase mb-1 print:text-gray-400">
                Nomor Registrasi Sistem
              </p>
              <h1 className="text-3xl font-bold print:text-lg">
                {data.no_reg}
              </h1>
              {!isEditingNo && invoiceNo && (
                <p className="mt-2 text-cyan-200 text-sm font-mono flex items-center gap-2 print:text-black print:text-xs">
                  <CreditCard size={14} /> Invoice: {invoiceNo}
                </p>
              )}
            </div>
            {/* Status Badge */}
            <div className="bg-white/20 px-4 py-1.5 rounded-full border border-white/30 print:border-black print:text-black">
              <span className="font-bold text-sm uppercase">{data.status}</span>
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
                  <span className="col-span-2">{data.nik || "-"}</span>
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
                  <span className="col-span-2">{data.alamat || "-"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Kontak</span>
                  <span className="col-span-2">{data.no_kontak || "-"}</span>
                </div>
              </div>
            </div>

            {/* Kanan: Sampel & Layanan */}
            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4 print:border-black print:mb-2">
                <Activity className="text-cyan-600 print:hidden" size={20} />
                <h3 className="font-bold text-gray-800 print:text-black print:text-sm print:uppercase">
                  Info Sampel & Biaya
                </h3>
              </div>
              <div className="print:text-xs space-y-2 mb-4">
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Asal Sampel</span>
                  <span className="col-span-2 font-medium">
                    {data.asal_sampel}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Pengirim/Instansi</span>
                  <span className="col-span-2 font-medium">
                    {data.pengirim_instansi || "-"}
                  </span>
                </div>
                {/* ------------------------------------------------------- */}

                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Pembayaran</span>
                  <span className="col-span-2 font-medium">
                    {data.status_pembayaran || "berbayar"}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-500">Waktu Terima</span>
                  <span className="col-span-2">
                    {formatDate(data.tgl_terima)} —{" "}
                    {data.waktu_sampling?.slice(0, 5) || "00:00"} WIB
                  </span>
                </div>
                {data.catatan_tambahan && (
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500 flex gap-1 items-start">
                      Catatan
                    </span>
                    <span className="col-span-2 text-orange-600 font-medium italic">
                      {data.catatan_tambahan}
                    </span>
                  </div>
                )}
              </div>

              {/* Tabel Rincian Keuangan */}
              <div className="print:mt-4">
                <div className="flex items-center gap-2 mb-2 print:hidden">
                  <CreditCard size={16} className="text-cyan-600" />
                  <span className="font-bold text-gray-800">
                    Rincian Pemeriksaan
                  </span>
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
            <div className="text-center">
              <p>
                Aceh Besar,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mb-12">Pengelola PNBP</p>
              <p className="font-bold underline">
                (
                {currentUser?.fullname ||
                  currentUser?.username ||
                  "Admin Labkesmas"}
                )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
