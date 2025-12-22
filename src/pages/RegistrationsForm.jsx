import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Save,
  X,
  User,
  FlaskConical,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Search,
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
      {/* Icon chevron */}
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
        ▼
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

// --- COMPONENT BARU: PILIH PEMERIKSAAN ---
const ExaminationSelector = ({ selectedIds, onChange, masterData }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Group data by category
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

  // Format Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Pilih Item Pemeriksaan (SK Retribusi)
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pemeriksaan (misal: Gula Darah)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {Object.entries(groupedData).map(([category, items]) => {
          // Filter items based on search
          const filteredItems = items.filter((item) =>
            item.nama_pemeriksaan
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={category}>
              <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 py-1">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={`cursor-pointer p-3 rounded-lg border transition-all flex justify-between items-center ${
                        isSelected
                          ? "bg-cyan-50 border-cyan-500 shadow-sm"
                          : "bg-white border-gray-200 hover:border-cyan-300"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.nama_pemeriksaan}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRupiah(item.harga)}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-cyan-600" />
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

export default function RegistrationForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [masterPemeriksaan, setMasterPemeriksaan] = useState([]);
  const [selectedPemeriksaanIds, setSelectedPemeriksaanIds] = useState([]);
  const [totalBiaya, setTotalBiaya] = useState(0);

  // Fetch Master Data saat komponen dimuat
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await api.get("/master/pemeriksaan");
        if (res.data.success) {
          setMasterPemeriksaan(res.data.data);
        }
      } catch (err) {
        console.error("Gagal load master data", err);
        toast.error("Gagal memuat daftar harga pemeriksaan");
      }
    };
    fetchMaster();
  }, []);

  // Hitung Total Biaya setiap kali seleksi berubah
  useEffect(() => {
    const total = masterPemeriksaan
      .filter((item) => selectedPemeriksaanIds.includes(item.id))
      .reduce((sum, item) => sum + Number(item.harga), 0);
    setTotalBiaya(total);
  }, [selectedPemeriksaanIds, masterPemeriksaan]);

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
    // jenis_pemeriksaan dihapus karena digantikan selection
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
    if (selectedPemeriksaanIds.length === 0) {
      toast.warning("Mohon pilih minimal satu jenis pemeriksaan");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      pemeriksaan_ids: selectedPemeriksaanIds, // Kirim array ID
    };

    // Bersihkan nilai null/empty string
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    try {
      await api.post("/registrations", payload);
      toast.success("Registrasi berhasil dibuat!");
      if (onSuccess) onSuccess();

      // Reset Form
      setForm({ ...form, nama_pasien: "", nik: "" });
      setSelectedPemeriksaanIds([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Registrasi Pasien Baru (BLKM)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi formulir dan pilih jenis pemeriksaan sesuai SK Retribusi.
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

        {/* SECTION 2: DATA PEMERIKSAAN (REVISED) */}
        <div>
          <h3 className="text-base font-bold text-cyan-700 mb-4 flex items-center gap-2">
            <FlaskConical size={18} /> Pilih Pemeriksaan
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bagian Kiri: Selector */}
            <div className="lg:col-span-2">
              <ExaminationSelector
                masterData={masterPemeriksaan}
                selectedIds={selectedPemeriksaanIds}
                onChange={setSelectedPemeriksaanIds}
              />
            </div>

            {/* Bagian Kanan: Summary Biaya & Info Sampel */}
            <div className="space-y-4">
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                <p className="text-sm text-cyan-800 mb-1">
                  Total Estimasi Biaya
                </p>
                <p className="text-2xl font-bold text-cyan-700">
                  {formatRupiah(totalBiaya)}
                </p>
                <p className="text-xs text-cyan-600 mt-2">
                  {selectedPemeriksaanIds.length} item dipilih
                </p>
              </div>

              <FormInput
                label="Asal Sampel"
                name="asal_sampel"
                value={form.asal_sampel}
                onChange={handleChange}
                placeholder="Mandiri / RSUD..."
              />

              <FormInput
                label="Tgl Terima Sampel"
                type="date"
                name="tgl_terima"
                value={form.tgl_terima}
                onChange={handleChange}
                icon={CalendarDays}
              />
            </div>
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
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-200 hover:shadow-cyan-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Save size={18} /> Simpan Registrasi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
