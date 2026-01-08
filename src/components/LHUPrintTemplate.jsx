// src/components/LHUPrintTemplate.jsx
import React from "react";

export default function LHUPrintTemplate({ data }) {
  if (!data) return null;

  return (
    <div className="p-8 font-sans text-black max-w-[21cm] mx-auto">
      {/* HEADER KOP SURAT */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        <img
          src="/src/assets/kop_mail.png"
          alt="Logo"
          className="w-auto object-contain"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <h3 className="text-center font-bold text-lg underline mb-6">
        FORMULIR HASIL PEMERIKSAAN LABORATORIUM
      </h3>

      {/* INFO PASIEN TABLE */}
      <div className="grid grid-cols-2 gap-8 text-sm mb-6">
        <table>
          <tbody>
            <tr>
              <td className="w-32 py-1">Dokter Pengirim</td>
              <td>: {data.dokter_pengirim || "-"}</td>
            </tr>
            <tr>
              <td className="py-1">Alamat</td>
              <td>: {data.alamat || "-"}</td>
            </tr>
            <tr>
              <td className="py-1">No. Rekam Medik</td>
              <td>: {data.nik || "-"}</td>
            </tr>
            <tr>
              <td className="py-1">Nama Pasien</td>
              <td>
                : <b>{data.nama_pasien}</b>
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td className="w-32 py-1">Tanggal Lahir</td>
              <td>: {new Date(data.tgl_lahir).toLocaleDateString("id-ID")}</td>
            </tr>
            <tr>
              <td className="py-1">No. Registrasi</td>
              <td>: {data.no_reg}</td>
            </tr>
            <tr>
              <td className="py-1">Kode Lab</td>
              <td>: {data.no_sampel_lab}</td>
            </tr>
            <tr>
              <td className="py-1">Waktu Sampling</td>
              <td>: {data.waktu_sampling} WIB</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* HASIL TABLE */}
      <table className="w-full border-collapse border border-black text-sm mb-8">
        <thead className="bg-gray-100">
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
              <tr key={idx}>
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
      <div className="flex justify-end mt-12">
        <div className="text-center">
          <p className="mb-20">
            Aceh Besar,{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            <br />
            Dokter Penanggung Jawab
          </p>
          <p className="font-bold underline text-sm">
            dr. Uzi Mardha Phoenna, Sp.PK
          </p>
        </div>
      </div>
    </div>
  );
}
