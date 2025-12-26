import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Search,
  Clock, // [NEW] Tambahkan Clock icon
  CalendarDays, // [NEW] Tambahkan CalendarDays
} from "lucide-react";

// --- Form Components ---
const FormInput = ({
  label,
  type = "text",
  disabled,
  icon: Icon,
  ...props
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-gray-500" />} {label}
    </label>
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

// --- Component Selector ---
const ExaminationSelector = ({ selectedIds, onChange, masterData }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedData = masterData.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = [];
    acc[item.kategori].push(item);
    return acc;
  }, {});

  const handleToggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Pilih Item Pemeriksaan (Edit)
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pemeriksaan..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {Object.entries(groupedData).map(([category, items]) => {
          const filteredItems = items.filter((item) =>
            item.nama_pemeriksaan
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
          if (filteredItems.length === 0) return null;
          return (
            <div key={category}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">
                {category}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={`cursor-pointer p-2.5 rounded-lg border transition-all flex justify-between items-center ${
                        isSelected
                          ? "bg-yellow-50 border-yellow-500 shadow-sm"
                          : "bg-gray-50 border-gray-100 hover:border-yellow-300"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.nama_pemeriksaan}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatRupiah(item.harga)}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-yellow-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function RegistrationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State Master Data
  const [masterPemeriksaan, setMasterPemeriksaan] = useState([]);
  const [selectedPemeriksaanIds, setSelectedPemeriksaanIds] = useState([]);
  const [totalBiaya, setTotalBiaya] = useState(0);

  // [NEW] State untuk list item detail di footer
  const [selectedItemsDetails, setSelectedItemsDetails] = useState([]);

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
    tgl_terima: "",
    waktu_sampling: "", // [NEW] Field waktu
    tgl_pengambilan: "",
    no_reg: "",
    no_sampel_lab: "",
    petugas_input: "",
  });

  // Load Master Data & Detail Registrasi
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 1. Load Master Data
        const masterRes = await api.get("/master/pemeriksaan");
        if (masterRes.data.success) setMasterPemeriksaan(masterRes.data.data);

        // 2. Load Registration Data
        const res = await api.get(`/registrations/${id}`);
        const data = res.data.data;

        const formatDate = (d) =>
          d ? new Date(d).toISOString().split("T")[0] : "";

        setForm({
          ...data,
          tgl_lahir: formatDate(data.tgl_lahir),
          tgl_terima: formatDate(data.tgl_terima),
          waktu_sampling: data.waktu_sampling || "", // [NEW] Load waktu
          tgl_pengambilan: formatDate(data.tgl_pengambilan),
        });

        // 3. Set Selected IDs
        if (data.details && Array.isArray(data.details)) {
          setSelectedPemeriksaanIds(data.details.map((d) => d.pemeriksaan_id));
        } else if (data.pemeriksaan_ids) {
          setSelectedPemeriksaanIds(data.pemeriksaan_ids);
        }
      } catch (err) {
        toast.error("Gagal memuat data");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, navigate]);

  // Hitung ulang total biaya realtime & Update Details
  useEffect(() => {
    const selectedItems = masterPemeriksaan.filter((item) =>
      selectedPemeriksaanIds.includes(item.id)
    );

    // Update display items
    setSelectedItemsDetails(selectedItems);

    const total = selectedItems.reduce(
      (sum, item) => sum + Number(item.harga),
      0
    );
    setTotalBiaya(total);
  }, [selectedPemeriksaanIds, masterPemeriksaan]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // [NEW] Auto Age Calculator juga perlu di Edit jika tgl lahir diubah
  useEffect(() => {
    if (form.tgl_lahir) {
      const today = new Date();
      const birthDate = new Date(form.tgl_lahir);

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      // Hanya update umur jika user mengubah tgl lahir (opsional, tapi bagus untuk konsistensi)
      setForm((prev) => ({ ...prev, umur: age < 0 ? 0 : age }));
    }
  }, [form.tgl_lahir]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const {
      no_reg,
      no_sampel_lab,
      id: _,
      created_at,
      updated_at,
      jenis_pemeriksaan,
      total_biaya,
      ...cleanForm
    } = form;

    const payload = {
      ...cleanForm,
      pemeriksaan_ids: selectedPemeriksaanIds,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });

    try {
      await api.put(`/registrations/${id}`, payload);
      toast.success("Perubahan disimpan");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* Header */}
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

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Read Only Header */}
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
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* KOLOM KIRI: Form Pasien */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                    Identitas Pasien
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Otomatis"
                    />
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
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Alamat Lengkap
                      </label>
                      <textarea
                        name="alamat"
                        value={form.alamat}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 h-20 focus:ring-2 focus:ring-yellow-200 outline-none text-sm mt-1"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                    Info Sampel
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* [NEW] Baris Tanggal dan Jam Terima */}
                    <FormInput
                      label="Tgl Terima"
                      type="date"
                      name="tgl_terima"
                      value={form.tgl_terima}
                      onChange={handleChange}
                      icon={CalendarDays}
                    />
                    <FormInput
                      label="Jam Terima"
                      type="time"
                      name="waktu_sampling"
                      value={form.waktu_sampling}
                      onChange={handleChange}
                      icon={Clock}
                    />

                    <FormInput
                      label="Coding"
                      name="coding"
                      value={form.coding}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Selector Pemeriksaan */}
              <div className="lg:col-span-1 h-full flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Item Pemeriksaan
                </h3>
                <ExaminationSelector
                  masterData={masterPemeriksaan}
                  selectedIds={selectedPemeriksaanIds}
                  onChange={setSelectedPemeriksaanIds}
                />
              </div>
            </div>

            {/* ACTION BAR (FOOTER) */}
            <div className="mt-auto bg-gray-50 border-t border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Bagian Kiri: Total Harga & Summary Items */}
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-yellow-100 p-3 rounded-xl text-yellow-700 shrink-0">
                  <span className="font-bold text-xl">Rp</span>
                </div>

                <div className="flex flex-col w-full max-w-sm">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Total Estimasi Biaya
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatRupiah(totalBiaya)}
                    </p>
                  </div>

                  {/* [NEW] LIST ITEM TERPILIH DI FOOTER */}
                  {selectedItemsDetails.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 max-h-20 overflow-y-auto custom-scrollbar border-l-2 border-yellow-300 pl-2">
                      {selectedItemsDetails.map((item, idx) => (
                        <span key={item.id}>
                          {item.nama_pemeriksaan}
                          {idx < selectedItemsDetails.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bagian Kanan: Tombol Aksi */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-white hover:border-gray-400 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-200 hover:shadow-yellow-300 transition flex items-center justify-center gap-2"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
