// src/components/LHUPrintTemplate.jsx

import React from "react";
import kopMailImg from "../assets/kop_mail.png";
import QRCode from "react-qr-code";

export default function LHUPrintTemplate({ data }) {
  if (!data) return null;

  // Helper untuk format tanggal konsisten (Indonesia)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Ambil validator dari data registrasi
  const validatorName = data.validator || "dr. Uzi Mardha Phoenna, Sp.PK";

  // Create QR Value String (Data validasi yang akan muncul saat di-scan)
  const qrValidationData = JSON.stringify({
    rs: "BLKM Banda Aceh",
    reg: data.no_reg,
    lab_id: data.no_sampel_lab,
    pasien: data.nama_pasien,
    status: "VALIDATED",
    validator: validatorName,
    date: data.validated_at || new Date().toISOString(),
  });

  return (
    <div className="font-sans text-black max-w-[21cm] mx-auto print:w-full print:max-w-none">
      {/* HEADER KOP SURAT */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        <img
          src={kopMailImg}
          alt="Logo"
          className="w-auto object-contain"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <h3 className="text-center font-bold text-lg mb-6">
        FORMULIR HASIL PEMERIKSAAN LABORATORIUM
      </h3>

      {/* INFO PASIEN TABLE */}
      <div className="grid grid-cols-2 gap-8 text-sm mb-6 break-inside-avoid">
        {/* ... (Bagian Table Kiri Tetap Sama) ... */}
        <table>
          <tbody>
            <tr>
              <td className="py-1">Nama Pasien</td>
              <td>
                : <b>{data.nama_pasien}</b>
              </td>
            </tr>
            <tr>
              <td className="w-32 py-1">Tanggal Lahir</td>
              <td>: {formatDate(data.tgl_lahir)}</td>
            </tr>
            <tr>
              <td className="w-32 py-1">NIK</td>
              <td>: {data.nik || "-"}</td>
            </tr>
            <tr>
              <td className="py-1">Alamat</td>
              <td>: {data.alamat || "-"}</td>
            </tr>
            <tr>
              <td className="py-1">No. HP/Telepon</td>
              <td>: {data.no_kontak || "-"}</td>
            </tr>
          </tbody>
        </table>

        {/* ... (Bagian Table Kanan Tetap Sama) ... */}
        <table>
          <tbody>
            <tr>
              <td className="py-1">No. Registrasi</td>
              <td>: {data.no_reg}</td>
            </tr>
            <tr>
              <td className="py-1">Tanggal daftar</td>
              <td>: {formatDate(data.tgl_daftar)}</td>
            </tr>
            <tr>
              <td className="py-1">Kode/ID Lab</td>
              <td>: {data.no_sampel_lab}</td>
            </tr>
            <tr>
              <td className="py-1">Waktu Daftar</td>
              <td>: {data.waktu_daftar} WIB</td>
            </tr>
            <tr>
              <td className="py-1">Validator</td>
              <td>: {data.validator || "Belum divalidasi"}</td>
            </tr>
            <tr>
              <td className="py-1">Tanggal Validasi</td>
              <td>
                : {data.validated_at ? formatDate(data.validated_at) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* HASIL TABLE */}
      <table className="w-full border-collapse border border-black text-sm mb-8">
        <thead className="bg-gray-100 print:table-header-group">
          <tr>
            <th className="border border-black p-2 text-left">
              JENIS PEMERIKSAAN
            </th>
            <th className="border border-black p-2 text-center">HASIL</th>
            <th className="border border-black p-2 text-center">
              NILAI RUJUKAN
            </th>
            <th className="border border-black p-2 text-center">
              SATUAN / METODE
            </th>
          </tr>
        </thead>
        <tbody>
          {data.tests &&
            data.tests.map((test, idx) => (
              <tr
                key={idx}
                className="break-inside-avoid page-break-inside-avoid"
              >
                <td className="border border-black p-2">
                  {test.parameter_name}
                </td>
                <td className="border border-black p-2 text-center font-bold">
                  {test.nilai}
                </td>
                <td className="border border-black p-2 text-center">
                  {test.nilai_rujukan}
                </td>
                <td className="border border-black p-2 text-center">
                  {test.satuan}
                  <br />
                  <span className="text-[10px] uppercase">{test.metode}</span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* FOOTER TTD & QR CODE */}
      <div className="flex justify-end mt-8 break-inside-avoid page-break-inside-avoid">
        <div className="flex flex-col items-center justify-center text-center w-64">
          <p className="mb-4">
            Aceh Besar,{" "}
            {data.validated_at
              ? formatDate(data.validated_at)
              : new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            <br />
            Dokter Penanggung Jawab
          </p>

          {/* IMPLEMENTASI QR CODE DISINI */}
          <div className="py-2">
            <QRCode
              value={qrValidationData}
              size={90} // Ukuran pas untuk tanda tangan
              level="M" // Error correction level
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
          <span className="text-[9px] text-gray-400 mb-2">
            Validasi Digital
          </span>

          <p className="font-bold text-sm underline">{validatorName}</p>
        </div>
      </div>
    </div>
  );
}
