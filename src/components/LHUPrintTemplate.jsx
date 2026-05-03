import React, { useState, useEffect } from "react";
import kopMailImg from "../assets/kop_mail.png";
import QRCode from "react-qr-code";
import api from "../api/axios";
import { formatDate, formatTime } from "../utils/dateHelper";

// --- SMART PARSER ---
const parseRefConfig = (rujukanString) => {
  try {
    if (!rujukanString) return { jenis: "teks", teks_bebas: "-" };

    let minified;
    if (typeof rujukanString === "string") {
      if (!rujukanString.trim().startsWith("{")) {
        return { jenis: "teks", teks_bebas: rujukanString };
      }
      try {
        minified = JSON.parse(rujukanString);
      } catch (e) {
        return { jenis: "teks", teks_bebas: "Format terpotong / Data Lama" };
      }
    } else {
      minified = rujukanString;
    }

    if (minified.jenis) return minified;

    if (minified.j === "kan") {
      return {
        jenis: "kuantitatif",
        beda_gender: minified.bg,
        kuantitatif: {
          umum: minified.u || { min: "", max: "" },
          L: minified.L || { min: "", max: "" },
          P: minified.P || { min: "", max: "" },
        },
      };
    } else if (minified.j === "kal") {
      return {
        jenis: "kualitatif",
        kualitatif: {
          opsi: minified.o || "Negatif, Positif",
          normal: minified.n || "Negatif",
        },
      };
    } else if (minified.j === "txt") {
      return {
        jenis: "teks",
        teks_bebas: minified.v || "-",
      };
    }

    return { jenis: "teks", teks_bebas: "-" };
  } catch {
    return { jenis: "teks", teks_bebas: "Format tidak valid" };
  }
};

// --- UI/UX RENDERER KHUSUS LHU ---
// Parameter kedua `satuan` ditambahkan untuk merender satuan di samping angka
const renderLhuReference = (config, satuan) => {
  if (!config) return "-";

  // Amankan format satuan (hanya tampil jika valid)
  const unitText =
    satuan && satuan !== "-" && satuan.trim() !== "" ? ` ${satuan}` : "";

  // [BEST PRACTICE]: Jangan tempel satuan ke teks_bebas, karena biasanya admin sudah
  // mengetik satuan secara manual di dalam teks bebas tersebut.
  if (config.jenis === "teks") return config.teks_bebas || "-";

  if (config.jenis === "kualitatif") return config.kualitatif?.normal || "-";

  if (config.jenis === "kuantitatif") {
    if (config.beda_gender) {
      const lMin = config.kuantitatif?.L?.min || "-";
      const lMax = config.kuantitatif?.L?.max || "-";
      const pMin = config.kuantitatif?.P?.min || "-";
      const pMax = config.kuantitatif?.P?.max || "-";

      return (
        <div className="text-left inline-block text-[12px] leading-snug whitespace-nowrap">
          <div>
            <span className="font-semibold">Laki-laki</span> : {lMin} - {lMax}
            {unitText}
          </div>
          <div>
            <span className="font-semibold">Perempuan</span> : {pMin} - {pMax}
            {unitText}
          </div>
        </div>
      );
    } else {
      const umum = config.kuantitatif?.umum;
      if (
        umum &&
        umum.min !== undefined &&
        umum.max !== undefined &&
        umum.min !== "" &&
        umum.max !== ""
      ) {
        return `${umum.min} - ${umum.max}${unitText}`;
      }
    }
  }
  return "-";
};
// ---------------------------------

export default function LHUPrintTemplate({ data }) {
  const [signatureMode, setSignatureMode] = useState("qr");

  useEffect(() => {
    const fetchSignatureMode = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data.success && res.data.data.signature_mode) {
          setSignatureMode(res.data.data.signature_mode);
        }
      } catch (error) {
        console.error("Gagal mengambil pengaturan signature", error);
      }
    };
    fetchSignatureMode();
  }, []);

  if (!data) return null;

  const extractTestCategory = () => {
    if (!data.jenis_pemeriksaan) return "PEMERIKSAAN LABORATORIUM";
    return data.jenis_pemeriksaan
      .replace(/\(\d+\)/g, "")
      .replace(/,/g, " & ")
      .trim()
      .toUpperCase();
  };

  const masterCategoryName = extractTestCategory();
  const validatorName = data.validator || "dr. Uzi Mardha Phoenna, Sp.PK";

  const qrValidationData = JSON.stringify({
    rs: "BLKM Banda Aceh",
    reg: data.no_reg,
    lab_id: data.no_sampel_lab,
    pasien: data.nama_pasien,
    status: "VALIDATED",
    validator: validatorName,
    date: data.validated_at || new Date().toISOString(),
  });

  const formatTimeStr = (dateString) => {
    if (!dateString) return "-";
    const dateObj = new Date(dateString);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "-";
  };

  return (
    <div className="font-sans text-black max-w-[21cm] mx-auto print:w-full print:max-w-none">
      {/* HEADER KOP SURAT */}
      <div className="flex justify-between items-center mb-6 pb-4">
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
              <td className="w-32 py-1">Dokter</td>
              <td>
                : {data.dokter || "-"}
              </td>
            </tr>
            <tr>
              <td className="w-32 py-1">No. Rekam Medik</td>
              <td>
                : {data.no_rekam_medik || "-"}
              </td>
            </tr>
            <tr>
              <td className="py-1">Nama Pasien</td>
              <td>
                : <b>{data.nama_pasien}</b>
              </td>
            </tr>
            <tr>
              <td className="py-1">Tanggal Lahir</td>
              <td>: {formatDate(data.tgl_lahir)}</td>
            </tr>
            <tr>
              <td className="py-1">NIK</td>
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
              <td className="py-1">Nomor Sampel</td>
              <td>: {data.no_sampel_lab}</td>
            </tr>
            <tr>
              <td className="py-1">Tgl/Waktu Daftar</td>
              <td>
                : {formatDate(data.tgl_daftar)} -{" "}
                {formatTimeStr(data.waktu_daftar)} WIB
              </td>
            </tr>
            {/* POIN 2 & 3: Waktu Pengambilan Sampel & Jam Terbit Hasil */}
            <tr>
              <td className="py-1">Jam Waktu Sampling</td>
              <td>
                :{" "}
                {data.waktu_pengambilan
                  ? formatTimeStr(data.waktu_pengambilan) + " WIB"
                  : "-"}
              </td>
            </tr>
            <tr>
              <td className="py-1">Jam Terbit Hasil</td>
              <td>
                :{" "}
                {data.validated_at
                  ? formatTimeStr(data.validated_at) + " WIB"
                  : "Belum terbit"}
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
          <tr className="bg-gray-50/50 print:bg-gray-50">
            <td className="border border-black px-2 py-1.5 font-bold uppercase text-left tracking-wide">
              {masterCategoryName}
            </td>
            <td className="border border-black px-2 py-1.5"></td>
            <td className="border border-black px-2 py-1.5"></td>
            <td className="border border-black px-2 py-1.5"></td>
          </tr>
          {data.tests &&
            data.tests.map((test, idx) => {
              const config = parseRefConfig(
                test.nilai_rujukan || test.range_normal,
              );

              return (
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
                  <td className="border border-black p-2 text-center align-middle">
                    {/* Render dengan pelemparan variabel Satuan */}
                    {renderLhuReference(config, test.satuan)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {test.satuan}
                    <br />
                    <span className="text-[10px] uppercase">{test.metode}</span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* FOOTER TTD & QR CODE */}
      {/* Diubah jadi flex-row, justify-between, */}
      <div className="flex w-full justify-between break-inside-avoid page-break-inside-avoid">
        {/* KIRI: INFO VALIDATOR */}
        <div className="text-sm mb-6">
          <table>
            <tbody>
              <tr>
                <td className="py-1 pr-4 whitespace-nowrap">Validator</td>
                <td>: {data.validator || "Belum divalidasi"}</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 whitespace-nowrap">
                  Tanggal Validasi
                </td>
                <td>
                  : {data.validated_at ? formatDate(data.validated_at) : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KANAN: KOTAK TTD */}
        <div className="flex flex-col items-center justify-center text-center w-64">
          <p className="">
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

          <div className="py-2">
            {signatureMode === "qr" ? (
              <QRCode
                value={qrValidationData}
                size={90}
                level="M"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            ) : (
              <div className="h-16 w-full"></div>
            )}
          </div>

          {signatureMode === "qr" && (
            <span className="text-[9px] text-gray-400 mb-1 block">
              Dokumen ini ditandatangani secara elektronik
            </span>
          )}
          <p className="font-bold text-sm underline">{validatorName}</p>
        </div>
      </div>
    </div>
  );
}
