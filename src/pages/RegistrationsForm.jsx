import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { AlertCircle, XCircle } from "lucide-react"; // Pastikan install lucide-react

// Komponen Helper Input (Tidak berubah)
const Input = ({ label, type = "text", ...props }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      {...props}
    />
  </div>
);

export default function RegistrationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // State untuk simpan pesan error

  const [form, setForm] = useState({
    nama_pasien: "",
    nik: "",
    tgl_lahir: "",
    umur: "",
    jenis_kelamin: "L",
    alamat: "",
    no_kontak: "",
    asal_sampel: "mandiri",
    no_sampel_asal: "",
    coding: "",
    jenis_pemeriksaan: "",
    tgl_terima: new Date().toISOString().split("T")[0],
    tgl_pengambilan: "",
    ket_pengerjaan: "",
    ket_pengiriman: "",
    form_pe: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Hapus pesan error jika user mulai mengetik lagi
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    // 1. SANITASI DATA SEBELUM KIRIM
    // Kita buat copy data form, lalu ubah string kosong "" menjadi null
    // Ini PENTING agar database tidak error saat menerima "" di kolom INT/DATE
    const payload = {};
    Object.keys(form).forEach((key) => {
      const value = form[key];
      if (value === "") {
        payload[key] = null;
      } else {
        payload[key] = value;
      }
    });

    try {
      // Kirim data yang sudah dibersihkan (payload)
      await api.post("/registrations", payload);

      toast.success("Data pasien berhasil disimpan!");

      // Reset form
      setForm({
        nama_pasien: "",
        nik: "",
        tgl_lahir: "",
        umur: "",
        jenis_kelamin: "L",
        alamat: "",
        no_kontak: "",
        asal_sampel: "mandiri",
        no_sampel_asal: "",
        coding: "",
        jenis_pemeriksaan: "",
        tgl_terima: new Date().toISOString().split("T")[0],
        tgl_pengambilan: "",
        ket_pengerjaan: "",
        ket_pengiriman: "",
        form_pe: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Full Error Object:", error);

      // 2. LOGIC PENANGKAPAN ERROR
      // Ambil pesan error dari respons backend jika ada
      const message =
        error.response?.data?.message || "Terjadi kesalahan pada server";
      const detail =
        error.response?.data?.stack || JSON.stringify(error.response?.data);

      // Tampilkan di Toast
      toast.error(`Gagal: ${message}`);

      // Tampilkan di UI Box Merah agar user bisa baca detailnya
      setServerError({ message, detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-4 border-b pb-2">
        Formulir Pendaftaran Sampel
      </h2>

      {/* 3. ALERT BOX ERROR UI */}
      {/* Ini akan muncul jika ada error, memberitahu detail masalahnya */}
      {serverError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3 items-start">
          <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="overflow-hidden">
            <h3 className="font-bold">Gagal Menyimpan Data</h3>
            <p className="text-sm">{serverError.message}</p>
            {/* Tampilkan detail teknis jika perlu debugging */}
            <details className="mt-2 text-xs text-red-500 cursor-pointer">
              <summary>Lihat Detail Teknis (Untuk Developer)</summary>
              <pre className="mt-1 whitespace-pre-wrap break-words font-mono bg-red-100 p-2 rounded">
                {serverError.detail}
              </pre>
            </details>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="col-span-full font-semibold text-gray-500 mt-2">
          Identitas Pasien
        </div>

        <Input
          label="Nama Pasien"
          name="nama_pasien"
          value={form.nama_pasien}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <Input
          label="NIK"
          name="nik"
          value={form.nik}
          onChange={handleChange}
          disabled={loading}
        />
        <Input
          label="Tanggal Lahir"
          type="date"
          name="tgl_lahir"
          value={form.tgl_lahir}
          onChange={handleChange}
          disabled={loading}
        />
        <Input
          label="Umur (Th)"
          type="number"
          name="umur"
          value={form.umur}
          onChange={handleChange}
          disabled={loading}
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin
          </label>
          <select
            name="jenis_kelamin"
            value={form.jenis_kelamin}
            onChange={handleChange}
            disabled={loading}
            className="border p-2 rounded focus:ring-2 ring-blue-500 bg-white"
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <Input
          label="No. Kontak / HP"
          name="no_kontak"
          value={form.no_kontak}
          onChange={handleChange}
          disabled={loading}
        />
        <div className="col-span-full">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Alamat Lengkap
          </label>
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            disabled={loading}
            className="w-full border p-2 rounded focus:ring-2 ring-blue-500 h-20"
          ></textarea>
        </div>

        <div className="col-span-full font-semibold text-gray-500 mt-4 border-t pt-4">
          Data Sampel & Pemeriksaan
        </div>

        <Input
          label="Asal Sampel"
          name="asal_sampel"
          value={form.asal_sampel}
          onChange={handleChange}
          placeholder="Contoh: Mandiri / RSUD..."
          disabled={loading}
        />
        <Input
          label="No. Sampel Asal (Opsional)"
          name="no_sampel_asal"
          value={form.no_sampel_asal}
          onChange={handleChange}
          disabled={loading}
        />
        <Input
          label="Coding / Kode Ins"
          name="coding"
          value={form.coding}
          onChange={handleChange}
          disabled={loading}
        />
        <Input
          label="Jenis Pemeriksaan"
          name="jenis_pemeriksaan"
          value={form.jenis_pemeriksaan}
          onChange={handleChange}
          placeholder="Kimia Darah, dll"
          required
          disabled={loading}
        />

        <Input
          label="Tanggal Terima"
          type="date"
          name="tgl_terima"
          value={form.tgl_terima}
          onChange={handleChange}
          disabled={loading}
        />
        <Input
          label="Tanggal Pengambilan"
          type="date"
          name="tgl_pengambilan"
          value={form.tgl_pengambilan}
          onChange={handleChange}
          disabled={loading}
        />

        <Input
          label="Ket. Pengerjaan"
          name="ket_pengerjaan"
          value={form.ket_pengerjaan}
          onChange={handleChange}
          placeholder="Cth: Selesai Dikerjakan"
          disabled={loading}
        />
        <Input
          label="Ket. Pengiriman"
          name="ket_pengiriman"
          value={form.ket_pengiriman}
          onChange={handleChange}
          placeholder="Cth: Sudah Dikirim"
          disabled={loading}
        />
        <Input
          label="Form PE"
          name="form_pe"
          value={form.form_pe}
          onChange={handleChange}
          disabled={loading}
        />

        <div className="col-span-full mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto px-6 py-2 rounded-lg font-semibold text-white transition-colors
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary"
              }
            `}
          >
            {loading ? "Menyimpan..." : "Simpan Registrasi"}
          </button>
        </div>
      </form>
    </div>
  );
}
