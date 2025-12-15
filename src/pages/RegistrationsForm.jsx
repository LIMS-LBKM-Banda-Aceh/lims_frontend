import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Save,
  X,
  User,
  FlaskConical,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";

// --- Reusable Modern Form Components ---
const FormInput = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-cyan-600" />}
      {label}
    </label>
    <input
      type={type}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none text-sm text-gray-800 placeholder-gray-400"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <select
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none text-sm appearance-none"
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  </div>
);

const FormTextarea = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <textarea
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none text-sm min-h-[100px]"
      {...props}
    />
  </div>
);

export default function RegistrationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {};
    Object.keys(form).forEach((key) => {
      payload[key] = form[key] === "" ? null : form[key];
    });

    try {
      await api.post("/registrations", payload);
      toast.success("Registrasi berhasil dibuat!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Registrasi Pasien Baru
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi formulir di bawah ini untuk mendaftarkan sampel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: DATA PASIEN */}
        <div>
          <h3 className="text-base font-bold text-cyan-700 mb-4 flex items-center gap-2">
            <User size={18} /> Identitas Pasien
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormInput
              label="Nama Lengkap"
              name="nama_pasien"
              value={form.nama_pasien}
              onChange={handleChange}
              required
              placeholder="Nama sesuai KTP"
            />
            <FormInput
              label="NIK"
              name="nik"
              value={form.nik}
              onChange={handleChange}
              placeholder="16 digit NIK"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Tgl Lahir"
                type="date"
                name="tgl_lahir"
                value={form.tgl_lahir}
                onChange={handleChange}
              />
              <FormInput
                label="Umur (Th)"
                type="number"
                name="umur"
                value={form.umur}
                onChange={handleChange}
              />
            </div>

            <FormSelect
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </FormSelect>

            <FormInput
              label="No. Kontak / HP"
              name="no_kontak"
              value={form.no_kontak}
              onChange={handleChange}
              placeholder="08..."
            />

            <div className="lg:col-span-3">
              <FormTextarea
                label="Alamat Lengkap"
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                placeholder="Jalan, Desa, Kecamatan..."
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* SECTION 2: DATA SAMPEL */}
        <div>
          <h3 className="text-base font-bold text-cyan-700 mb-4 flex items-center gap-2">
            <FlaskConical size={18} /> Data Sampel & Pemeriksaan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormInput
              label="Jenis Pemeriksaan"
              name="jenis_pemeriksaan"
              value={form.jenis_pemeriksaan}
              onChange={handleChange}
              required
              placeholder="Contoh: Kimia Darah"
            />
            <FormInput
              label="Asal Sampel"
              name="asal_sampel"
              value={form.asal_sampel}
              onChange={handleChange}
              placeholder="Mandiri / RSUD..."
            />
            <FormInput
              label="No. Sampel Asal (Opsional)"
              name="no_sampel_asal"
              value={form.no_sampel_asal}
              onChange={handleChange}
            />

            <FormInput
              label="Tgl Terima Sampel"
              type="date"
              name="tgl_terima"
              value={form.tgl_terima}
              onChange={handleChange}
              icon={CalendarDays}
            />
            <FormInput
              label="Tgl Pengambilan"
              type="date"
              name="tgl_pengambilan"
              value={form.tgl_pengambilan}
              onChange={handleChange}
              icon={CalendarDays}
            />

            <FormInput
              label="Coding / Kode"
              name="coding"
              value={form.coding}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* SECTION 3: KETERANGAN TAMBAHAN */}
        <div>
          <h3 className="text-base font-bold text-gray-500 mb-4 flex items-center gap-2">
            <FileSpreadsheet size={18} /> Keterangan Tambahan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput
              label="Ket. Pengerjaan"
              name="ket_pengerjaan"
              value={form.ket_pengerjaan}
              onChange={handleChange}
            />
            <FormInput
              label="Ket. Pengiriman"
              name="ket_pengiriman"
              value={form.ket_pengiriman}
              onChange={handleChange}
            />
            <FormInput
              label="Form PE"
              name="form_pe"
              value={form.form_pe}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-200 hover:shadow-cyan-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Save size={18} /> Simpan Registrasi
              </>
            )}
          </button>

          {/* Tombol Cancel (Optional, jika ingin reset form) */}
          <button
            type="button"
            onClick={() => setForm({ ...form, nama_pasien: "" })} // Simple reset logic
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <X size={18} /> Reset
          </button>
        </div>
      </form>
    </div>
  );
}
