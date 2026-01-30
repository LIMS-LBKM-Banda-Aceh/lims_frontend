// src/components/LHUPrintTemplate.jsx

import React from "react";
import kopMailImg from "../assets/kop_mail.png";

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

  // DEBUG: Tampilkan data yang diterima
  console.log("LHU Template Data:", {
    validator: data.validator,
    validatorExists: "validator" in data,
    validated_at: data.validated_at,
    allDataKeys: Object.keys(data),
  });

  // Ambil validator dari data registrasi
  // Prioritas: 1. validator dari data, 2. default
  const validatorName = data.validator || "dr. Uzi Mardha Phoenna, Sp.PK";

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

      {/* FOOTER TTD */}
      <div className="flex justify-end mt-12 break-inside-avoid page-break-inside-avoid">
        <div className="text-center">
          <p className="mb-20">
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
          <p className="font-bold text-sm">{validatorName}</p>
        </div>
      </div>
    </div>
  );
}
