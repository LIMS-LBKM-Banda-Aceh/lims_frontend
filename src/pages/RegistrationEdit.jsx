import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Komponen Helper Input (sama seperti di RegistrationForm)
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

export default function RegistrationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

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
    fetchRegistration();
  }, [id]);

  const fetchRegistration = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/registrations/${id}`);
      const data = res.data.data;

      // Format tanggal untuk input type="date"
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setForm({
        nama_pasien: data.nama_pasien || "",
        nik: data.nik || "",
        tgl_lahir: formatDateForInput(data.tgl_lahir),
        umur: data.umur || "",
        jenis_kelamin: data.jenis_kelamin || "L",
        alamat: data.alamat || "",
        no_kontak: data.no_kontak || "",
        asal_sampel: data.asal_sampel || "mandiri",
        no_sampel_asal: data.no_sampel_asal || "",
        coding: data.coding || "",
        jenis_pemeriksaan: data.jenis_pemeriksaan || "",
        tgl_terima: formatDateForInput(data.tgl_terima),
        tgl_pengambilan: formatDateForInput(data.tgl_pengambilan),
        ket_pengerjaan: data.ket_pengerjaan || "",
        ket_pengiriman: data.ket_pengiriman || "",
        form_pe: data.form_pe || "",
        no_reg: data.no_reg || "",
        no_sampel_lab: data.no_sampel_lab || "",
      });
    } catch (error) {
      toast.error("Gagal mengambil data registrasi");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setServerError(null);

    // Sanitasi data: ubah string kosong menjadi null
    const payload = {};
    Object.keys(form).forEach((key) => {
      if (key === "no_reg" || key === "no_sampel_lab") return; // Skip fields read-only
      const value = form[key];
      payload[key] = value === "" ? null : value;
    });

    try {
      await api.put(`/registrations/${id}`, payload);
      toast.success("Data registrasi berhasil diperbarui!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Full Error Object:", error);
      const message =
        error.response?.data?.message || "Terjadi kesalahan pada server";
      const detail =
        error.response?.data?.stack || JSON.stringify(error.response?.data);

      toast.error(`Gagal: ${message}`);
      setServerError({ message, detail });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">Edit Registrasi: {form.no_reg}</h2>
      </div>

      {/* Info Read-only */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500">
              No. Registrasi
            </label>
            <div className="font-medium">{form.no_reg}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">
              No. Sampel Lab
            </label>
            <div className="font-medium">{form.no_sampel_lab}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Status
            </label>
            <div className="font-medium text-yellow-600">Sedang diedit</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Petugas Input
            </label>
            <div className="font-medium">{form.petugas_input || "-"}</div>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {serverError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-bold">Gagal Menyimpan Perubahan</h3>
          <p className="text-sm">{serverError.message}</p>
          <details className="mt-2 text-xs text-red-500 cursor-pointer">
            <summary>Lihat Detail Teknis</summary>
            <pre className="mt-1 whitespace-pre-wrap break-words font-mono bg-red-100 p-2 rounded">
              {serverError.detail}
            </pre>
          </details>
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
          disabled={saving}
        />
        <Input
          label="NIK"
          name="nik"
          value={form.nik}
          onChange={handleChange}
          disabled={saving}
        />
        <Input
          label="Tanggal Lahir"
          type="date"
          name="tgl_lahir"
          value={form.tgl_lahir}
          onChange={handleChange}
          disabled={saving}
        />
        <Input
          label="Umur (Th)"
          type="number"
          name="umur"
          value={form.umur}
          onChange={handleChange}
          disabled={saving}
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Jenis Kelamin
          </label>
          <select
            name="jenis_kelamin"
            value={form.jenis_kelamin}
            onChange={handleChange}
            disabled={saving}
            className="border p-2 rounded focus:ring-2 ring-blue-500 bg-white"
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <Input
          label="No. Kontak / HP"
          type="tel"
          name="no_kontak"
          value={form.no_kontak}
          onChange={handleChange}
          pattern="[0-9 ]*"
          inputMode="numeric"
          disabled={saving}
        />

        <div className="col-span-full">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Alamat Lengkap
          </label>
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            disabled={saving}
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
          disabled={saving}
        />
        <Input
          label="No. Sampel Asal (Opsional)"
          name="no_sampel_asal"
          value={form.no_sampel_asal}
          onChange={handleChange}
          disabled={saving}
        />
        <Input
          label="Coding / Kode Ins"
          name="coding"
          value={form.coding}
          onChange={handleChange}
          disabled={saving}
        />
        <Input
          label="Jenis Pemeriksaan"
          name="jenis_pemeriksaan"
          value={form.jenis_pemeriksaan}
          onChange={handleChange}
          placeholder="Kimia Darah, dll"
          required
          disabled={saving}
        />

        <Input
          label="Tanggal Terima"
          type="date"
          name="tgl_terima"
          value={form.tgl_terima}
          onChange={handleChange}
          disabled={saving}
        />
        <Input
          label="Tanggal Pengambilan"
          type="date"
          name="tgl_pengambilan"
          value={form.tgl_pengambilan}
          onChange={handleChange}
          disabled={saving}
        />

        <Input
          label="Ket. Pengerjaan"
          name="ket_pengerjaan"
          value={form.ket_pengerjaan}
          onChange={handleChange}
          placeholder="Cth: Selesai Dikerjakan"
          disabled={saving}
        />
        <Input
          label="Ket. Pengiriman"
          name="ket_pengiriman"
          value={form.ket_pengiriman}
          onChange={handleChange}
          placeholder="Cth: Sudah Dikirim"
          disabled={saving}
        />
        <Input
          label="Form PE"
          name="form_pe"
          value={form.form_pe}
          onChange={handleChange}
          disabled={saving}
        />

        <div className="col-span-full mt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors
              ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-700"
              }
            `}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
