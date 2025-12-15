import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

// Gunakan komponen input yang sama dengan Form untuk konsistensi
const FormInput = ({ label, type = "text", disabled, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <input
      type={type}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none text-sm text-gray-800 ${
        disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
      }`}
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <select
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all outline-none text-sm appearance-none"
        {...props}
      >
        {children}
      </select>
    </div>
  </div>
);

export default function RegistrationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Default state sama seperti form
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
    tgl_terima: "",
    tgl_pengambilan: "",
    ket_pengerjaan: "",
    ket_pengiriman: "",
    form_pe: "",
    no_reg: "",
    no_sampel_lab: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/registrations/${id}`);
        const data = res.data.data;
        const formatDate = (d) =>
          d ? new Date(d).toISOString().split("T")[0] : "";

        setForm({
          ...data,
          tgl_lahir: formatDate(data.tgl_lahir),
          tgl_terima: formatDate(data.tgl_terima),
          tgl_pengambilan: formatDate(data.tgl_pengambilan),
          // pastikan null jadi string kosong
          ket_pengerjaan: data.ket_pengerjaan || "",
          ket_pengiriman: data.ket_pengiriman || "",
          form_pe: data.form_pe || "",
          petugas_input: data.petugas_input || "",
        });
      } catch (err) {
        toast.error("Gagal memuat data");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Filter payload (buang field read-only)
    const {
      no_reg,
      no_sampel_lab,
      id: _,
      created_at,
      updated_at,
      ...payload
    } = form;

    // Convert empty string to null
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });

    try {
      await api.put(`/registrations/${id}`, payload);
      toast.success("Perubahan disimpan");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- Layout Wrapper untuk Edit Page (Agar terlihat seperti dashboard) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Jika ingin full sidebar experience, Anda perlu me-wrap ini dengan Layout utama. 
          Namun untuk sekarang kita buat centered container yang rapi. */}

      <div className="max-w-5xl mx-auto py-10 px-6">
        {/* Header Nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition"
          >
            <div className="p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300">
              <ArrowLeft size={18} />
            </div>
            Kembali ke Dashboard
          </button>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
              Mode Edit
            </p>
            <h1 className="text-xl font-bold text-gray-800">
              Ubah Data Registrasi
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-fade-in">
          {/* Read Only Header Bar */}
          <div className="bg-yellow-50 border-b border-yellow-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase">
                  No. Registrasi
                </p>
                <p className="text-lg font-mono font-bold text-gray-800">
                  {form.no_reg}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase">
                  Sampel Lab
                </p>
                <p className="text-lg font-mono font-bold text-gray-800">
                  {form.no_sampel_lab}
                </p>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-400">Petugas Awal</p>
              <p className="font-medium text-gray-600">
                {form.petugas_input || "-"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section: Identitas */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Identitas Pasien
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormInput
                  label="Nama Lengkap"
                  name="nama_pasien"
                  value={form.nama_pasien}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="NIK"
                  name="nik"
                  value={form.nik}
                  onChange={handleChange}
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
                    label="Umur"
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
                  label="No. Kontak"
                  name="no_kontak"
                  value={form.no_kontak}
                  onChange={handleChange}
                />
                <div className="lg:col-span-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 h-20 focus:ring-2 focus:ring-yellow-200 outline-none text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Sampel */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Data Pemeriksaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormInput
                  label="Jenis Pemeriksaan"
                  name="jenis_pemeriksaan"
                  value={form.jenis_pemeriksaan}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Asal Sampel"
                  name="asal_sampel"
                  value={form.asal_sampel}
                  onChange={handleChange}
                />
                <FormInput
                  label="No. Sampel Asal"
                  name="no_sampel_asal"
                  value={form.no_sampel_asal}
                  onChange={handleChange}
                />
                <FormInput
                  label="Coding"
                  name="coding"
                  value={form.coding}
                  onChange={handleChange}
                />
                <FormInput
                  label="Tgl Terima"
                  type="date"
                  name="tgl_terima"
                  value={form.tgl_terima}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-200 hover:shadow-yellow-300 transition flex items-center gap-2"
              >
                {saving ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={18} /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
