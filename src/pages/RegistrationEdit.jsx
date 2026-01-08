// pages/RegistrationEdit.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Search,
  Clock,
  CalendarDays,
  FileText,
  Building2,
  Plus,
  Minus,
} from "lucide-react";

// --- Form Components (Tidak Berubah) ---
const FormInput = ({
  label,
  type = "text",
  disabled,
  icon: Icon,
  ...props
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-cyan-600" />} {label}
    </label>
    <input
      type={type}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none text-sm text-gray-800 ${
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
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none text-sm appearance-none"
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
        ▼
      </div>
    </div>
  </div>
);

// --- EXAMINATION SELECTOR DENGAN QUANTITY ---
const ExaminationSelector = ({ selectedItems, onChange, masterData }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedData = masterData.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = [];
    acc[item.kategori].push(item);
    return acc;
  }, {});

  const getItemQty = (id) => {
    const found = selectedItems.find((i) => Number(i.id) === Number(id));
    return found ? found.qty : 0;
  };

  const handleAdd = (item) => {
    const existing = selectedItems.find(
      (i) => Number(i.id) === Number(item.id)
    );
    if (existing) {
      onChange(
        selectedItems.map((i) =>
          Number(i.id) === Number(item.id) ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      onChange([...selectedItems, { ...item, qty: 1 }]);
    }
  };

  const handleRemove = (item) => {
    const existing = selectedItems.find(
      (i) => Number(i.id) === Number(item.id)
    );
    if (existing) {
      if (existing.qty > 1) {
        onChange(
          selectedItems.map((i) =>
            Number(i.id) === Number(item.id) ? { ...i, qty: i.qty - 1 } : i
          )
        );
      } else {
        onChange(selectedItems.filter((i) => Number(i.id) !== Number(item.id)));
      }
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
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 text-sm"
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
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1 z-10">
                {category}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {filteredItems.map((item) => {
                  const qty = getItemQty(item.id);
                  const isSelected = qty > 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border transition-all flex justify-between items-center ${
                        isSelected
                          ? "bg-cyan-50 border-cyan-500 shadow-sm"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p
                          className="text-sm font-medium text-gray-800 truncate"
                          title={item.nama_pemeriksaan}
                        >
                          {item.nama_pemeriksaan}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatRupiah(item.harga)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={!isSelected}
                          className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-30 transition"
                        >
                          <Minus size={12} />
                        </button>

                        <span
                          className={`text-xs font-bold w-4 text-center ${
                            isSelected ? "text-cyan-700" : "text-gray-300"
                          }`}
                        >
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-cyan-100 hover:bg-cyan-200 text-cyan-700 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
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

  // State Items (Array Object)
  const [selectedItems, setSelectedItems] = useState([]);

  const [totalBiaya, setTotalBiaya] = useState(0);

  // --- STATE FORM UTAMA ---
  const [form, setForm] = useState({
    nama_pasien: "",
    nik: "",
    tgl_lahir: "",
    umur: "",
    jenis_kelamin: "L",
    alamat: "",
    no_kontak: "",
    asal_sampel: "Mandiri",
    status_pembayaran: "berbayar",
    pengirim_instansi: "",
    tgl_terima: "",
    waktu_sampling: "",
    tgl_pengambilan: "",
    no_reg: "",
    no_sampel_lab: "",
    petugas_input: "",
    catatan_tambahan: "",
  });

  // Load Master Data & Detail Registrasi
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 1. Load Master Data
        const masterRes = await api.get("/master/pemeriksaan");
        let masterList = [];
        if (masterRes.data.success) {
          masterList = masterRes.data.data;
          setMasterPemeriksaan(masterList);
        }

        // 2. Load Registration Data
        const res = await api.get(`/registrations/${id}`);
        const data = res.data.data;

        const formatDate = (d) =>
          d ? new Date(d).toISOString().split("T")[0] : "";

        // [FIX] Format Jam: Ambil hanya 5 karakter pertama (HH:mm)
        // Format dari DB biasanya HH:mm:ss, kita ubah jadi HH:mm agar input type="time" bersih
        const formatTime = (t) => (t && t.length >= 5 ? t.substring(0, 5) : "");

        setForm({
          ...data,
          tgl_lahir: formatDate(data.tgl_lahir),
          tgl_terima: formatDate(data.tgl_terima),
          waktu_sampling: formatTime(data.waktu_sampling), // FIX DISINI
          tgl_pengambilan: formatDate(data.tgl_pengambilan),
          catatan_tambahan: data.catatan_tambahan || "",
          pengirim_instansi: data.pengirim_instansi || "",
          status_pembayaran: data.status_pembayaran || "berbayar",
          asal_sampel: data.asal_sampel || "Mandiri",
        });

        // 3. Transform Details ke Selected Items
        if (data.details && Array.isArray(data.details)) {
          const grouped = {};

          data.details.forEach((detail) => {
            const pid = detail.pemeriksaan_id;

            if (!grouped[pid]) {
              const masterItem = masterList.find((m) => m.id === pid);
              grouped[pid] = {
                id: pid,
                qty: 0,
                nama_pemeriksaan: masterItem
                  ? masterItem.nama_pemeriksaan
                  : detail.nama_pemeriksaan,
                harga: Number(detail.harga_saat_ini),
              };
            }
            grouped[pid].qty += 1;
          });

          setSelectedItems(Object.values(grouped));
        } else if (data.pemeriksaan_ids) {
          const items = data.pemeriksaan_ids
            .map((id) => {
              const master = masterList.find((m) => m.id === Number(id));
              return master ? { ...master, qty: 1 } : null;
            })
            .filter(Boolean);
          setSelectedItems(items);
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data registrasi");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, navigate]);

  // Kalkulasi Biaya
  useEffect(() => {
    if (form.status_pembayaran === "gratis") {
      setTotalBiaya(0);
    } else {
      const total = selectedItems.reduce(
        (sum, item) => sum + Number(item.harga) * item.qty,
        0
      );
      setTotalBiaya(total);
    }
  }, [selectedItems, form.status_pembayaran]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAsalSampelChange = (e) => {
    const val = e.target.value;
    const newStatus = val === "Mandiri" ? "berbayar" : "berbayar";
    setForm((prev) => ({
      ...prev,
      asal_sampel: val,
      status_pembayaran: newStatus,
    }));
  };

  // Auto Age
  useEffect(() => {
    if (form.tgl_lahir) {
      const today = new Date();
      const birthDate = new Date(form.tgl_lahir);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
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
      details,
      ...cleanForm
    } = form;

    const payload = {
      ...cleanForm,
      items: selectedItems.map((item) => ({ id: item.id, qty: item.qty })),
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });

    try {
      await api.put(`/registrations/${id}`, payload);
      toast.success("Perubahan berhasil disimpan");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan perubahan");
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
          <div className="bg-cyan-50 border-b border-cyan-100 p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-bold text-cyan-700 uppercase">
                  No. Registrasi
                </p>
                <p className="text-lg font-mono font-bold text-gray-800">
                  {form.no_reg}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-cyan-700 uppercase">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 h-20 focus:ring-2 focus:ring-cyan-200 outline-none text-sm mt-1"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                    Info Sampel & Admin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Asal Sampel"
                      name="asal_sampel"
                      value={form.asal_sampel}
                      onChange={handleAsalSampelChange}
                    >
                      <option value="Mandiri">Mandiri (Umum)</option>
                      <option value="Rujukan">Rujukan (Faskes/RS)</option>
                    </FormSelect>

                    {form.asal_sampel === "Rujukan" ? (
                      <FormSelect
                        label="Status Pembayaran"
                        name="status_pembayaran"
                        value={form.status_pembayaran}
                        onChange={handleChange}
                      >
                        <option value="berbayar">Berbayar</option>
                        <option value="gratis">Tidak Berbayar / Program</option>
                      </FormSelect>
                    ) : (
                      <FormInput
                        label="Status Pembayaran"
                        value="BERBAYAR (MANDIRI)"
                        disabled
                      />
                    )}

                    <FormInput
                      label="Pengirim / Instansi"
                      name="pengirim_instansi"
                      value={form.pengirim_instansi}
                      onChange={handleChange}
                      placeholder="Nama Dokter / RS / Klinik"
                      icon={Building2}
                    />

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
                  </div>

                  <div className="mt-4">
                    <FormInput
                      label="Catatan Tambahan"
                      name="catatan_tambahan"
                      value={form.catatan_tambahan}
                      onChange={handleChange}
                      icon={FileText}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 h-full flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Item Pemeriksaan
                </h3>
                <ExaminationSelector
                  masterData={masterPemeriksaan}
                  selectedItems={selectedItems}
                  onChange={setSelectedItems}
                />
              </div>
            </div>

            <div className="mt-auto bg-gray-50 border-t border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-cyan-100 p-3 rounded-xl text-cyan-700 shrink-0">
                  <span className="font-bold text-xl">Rp</span>
                </div>

                <div className="flex flex-col w-full max-w-sm">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Total Estimasi Biaya
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatRupiah(totalBiaya)}
                      </p>
                    </div>
                    {totalBiaya === 0 &&
                      form.status_pembayaran === "gratis" && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg font-bold border border-green-200">
                          GRATIS / SUBSIDI
                        </span>
                      )}
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 max-h-20 overflow-y-auto custom-scrollbar border-l-2 border-cyan-300 pl-2">
                      {selectedItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center mb-1"
                        >
                          <span className="truncate w-2/3">
                            {item.nama_pemeriksaan}
                          </span>
                          <span className="font-bold bg-white px-1.5 border border-cyan-200 rounded text-cyan-700">
                            x{item.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-200 transition flex items-center justify-center gap-2"
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
