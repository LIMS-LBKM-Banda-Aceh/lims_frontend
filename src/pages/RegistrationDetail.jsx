// pages/RegistrationDetail.jsx

import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import kopMailImg from "../assets/kop_mail.png";

import {
  ArrowLeft,
  Printer,
  User,
  Activity,
  CreditCard,
  Save,
  Edit2,
  FlaskConical,
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

  // Logic Render Tabel Biaya (Improved 2-Column UI/UX)
  const renderItemTable = () => {
    const details = data.details || [];
    const isGratis = data.status_pembayaran === "gratis";

    // 1. Grouping data agar item yang sama muncul dengan Qty
    const groupedDetails = details.reduce((acc, item) => {
      const key = item.nama_pemeriksaan;
      if (!acc[key]) {
        acc[key] = {
          nama: item.nama_pemeriksaan,
          harga: Number(item.harga_saat_ini),
          qty: 1,
        };
      } else {
        acc[key].qty += 1;
      }
      return acc;
    }, {});

    const items = Object.values(groupedDetails);

    if (items.length === 0) {
      return (
        <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm">
          Tidak ada rincian pemeriksaan.
        </div>
      );
    }

    // Pisahkan items menjadi dua bagian untuk 2 kolom
    const midIndex = Math.ceil(items.length / 2);
    const leftColumnItems = items.slice(0, midIndex);
    const rightColumnItems = items.slice(midIndex);

    const TableContent = ({ columnItems }) => (
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-2 py-2 text-left font-bold text-gray-600">
              Pemeriksaan
            </th>
            <th className="px-2 py-2 text-center font-bold text-gray-600 w-8">
              Qty
            </th>
            <th className="px-2 py-2 text-right font-bold text-gray-600">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {columnItems.map((item, idx) => (
            <tr key={idx}>
              <td
                className="px-2 py-2 text-gray-700 font-medium truncate max-w-[120px]"
                title={item.nama}
              >
                {item.nama}
              </td>
              <td className="px-2 py-2 text-center text-cyan-700 font-bold">
                {item.qty}
              </td>
              <td className="px-2 py-2 text-right text-gray-700 font-mono">
                {formatRupiah(item.harga * item.qty)
                  .replace("Rp", "")
                  .trim()}
              </td>
            </tr>
          ))}
          {/* Fill empty rows if needed to balance heights */}
          {columnItems.length === 0 && (
            <tr>
              <td colSpan="3" className="py-2 text-center text-gray-300">
                -
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );

    return (
      <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="col-span-1">
            <TableContent columnItems={leftColumnItems} />
          </div>
          <div className="col-span-1">
            <TableContent columnItems={rightColumnItems} />
          </div>
        </div>

        {/* Total Section Spanning Full Width */}
        <div className="border-t border-gray-200">
          {isGratis ? (
            <div className="bg-green-50/50 px-4 py-2 flex justify-between items-center border-b border-gray-200">
              <span className="text-xs text-green-700 italic font-medium">
                Diskon / Subsidi Program:
              </span>
              <span className="text-xs text-green-700 font-bold font-mono">
                - {formatRupiah(data.total_biaya || 0)}
              </span>
            </div>
          ) : null}

          <div
            className={`${
              isGratis ? "bg-secondary" : "bg-primary"
            } text-white print:bg-gray-100 print:text-black px-2 py-3 flex justify-between items-center`}
          >
            <span className="font-bold text-xs uppercase tracking-wider">
              {isGratis
                ? "Total Yang Harus Dibayar"
                : "Total Biaya Pemeriksaan"}
            </span>
            <span className="font-black text-lg font-mono">
              {isGratis ? "Rp 0" : formatRupiah(data.total_biaya)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in ">
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

        {/* Proteksi Role: Hanya Admin dan Kasir yang bisa melihat/mengedit nomor invoice & cetak */}
        {["admin", "kasir"].includes(currentUser?.role?.toLowerCase()) && (
          <div className="flex gap-2">
            {/* INPUT NOMOR INVOICE */}
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

            {/* TOMBOL PRINT */}
            <button
              onClick={() => globalThis.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
            >
              <Printer size={18} /> Cetak Bukti
            </button>
          </div>
        )}
      </div>
      <div id="print-section" className="print-content-padding">
        {/* --- KOP SURAT (PRINT VIEW) --- */}
        <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <img
            src={kopMailImg}
            alt="Logo"
            className="w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* JUDUL PRINT DENGAN NOMOR INVOICE */}
        <div className="hidden print:block text-center mb-6">
          <h3 className="text-lg font-extrabold text-black underline-offset-4 uppercase">
            INVOICE LAYANAN PNBP
            <br />
            BALAI LABORATORIUM KESEHATAN MASYARAKAT BANDA ACEH
          </h3>
          <p className="text-sm mt-1 uppercase tracking-widest">
            Nomor : {invoiceNo}
          </p>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
          <div className="bg-linear-to-r from-secondary to-primary p-8 text-white print:text-black print:bg-none print:p-0 print:border-b print:pb-4 print:mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white text-xs font-bold uppercase mb-1 print:text-gray-400">
                  Nomor Registrasi Sistem
                </p>
                <h1 className="text-3xl font-bold print:text-lg">
                  {data.no_reg}
                </h1>
                {data.no_sampel_lab && (
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20 print:border-black print:bg-transparent print:px-0 print:border-0">
                    <FlaskConical
                      size={16}
                      className="text-white print:text-black"
                    />
                    <span className="text-sm font-medium opacity-90 print:opacity-100">
                      Lab ID:{" "}
                      <span className="font-bold text-white print:text-black">
                        {data.no_sampel_lab}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-white/20 px-4 py-1.5 rounded-full border border-white/30 print:border-black print:text-black">
                <span className="font-bold text-sm uppercase">
                  {data.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 print:p-0">
            {/* Row 1: Identitas & Info Sampel Sejajar */}
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
                    <span className="text-gray-500">Umur / JK</span>
                    <span className="col-span-2">
                      {data.umur} Th /{" "}
                      {data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
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
                    Info Sampel & Layanan
                  </h3>
                </div>
                <div className="print:text-xs space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Asal Sampel</span>
                    <span className="col-span-2 font-medium">
                      {data.asal_sampel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Instansi</span>
                    <span className="col-span-2 font-medium">
                      {data.pengirim_instansi || "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Pembayaran</span>
                    <span className="col-span-2 font-medium">
                      {data.status_pembayaran || "berbayar"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500">Waktu Daftar</span>
                    <span className="col-span-2">
                      {formatDate(data.tgl_daftar)} —{" "}
                      {data.waktu_daftar?.slice(0, 5) || "00:00"} WIB
                    </span>
                  </div>
                  {data.catatan_tambahan && (
                    <div className="grid grid-cols-3">
                      <span className="text-gray-500 italic">Catatan</span>
                      <span className="col-span-2 text-orange-600 font-medium italic">
                        {data.catatan_tambahan}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Rincian Pemeriksaan (Full Width & 2 Columns) */}
            <div className="mt-8 print:mt-6 border-t border-gray-100 pt-6 print:border-black">
              <div className="flex items-center gap-2 mb-4 print:hidden">
                <CreditCard size={16} className="text-cyan-600" />
                <span className="font-bold text-gray-800">
                  Rincian Pemeriksaan
                </span>
              </div>
              {renderItemTable()}
            </div>

            {/* Footer Tanda Tangan */}
            <div className="hidden print:flex mt-8 pt-8 justify-between px-8 text-center text-xs text-black break-inside-avoid items-end">
              {/* SISI KIRI: PASIEN */}
              <div className="flex flex-col">
                {/* Baris kosong untuk menyeimbangkan baris lokasi/tanggal di sisi kanan */}
                <p className="mb-12">Pasien / Pengirim</p>
                {/* <p className="invisible">Placeholder</p> */}
                <p className="font-bold underline">
                  {data.nama_pasien || ".........................."}
                </p>
              </div>

              {/* SISI KANAN: PETUGAS */}
              <div className="flex flex-col">
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
                  {currentUser?.fullname ||
                    currentUser?.username ||
                    "Admin Labkesmas"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
