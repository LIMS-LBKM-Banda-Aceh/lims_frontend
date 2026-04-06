// pages/RegistrationEdit.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  Settings2,
  Loader2,
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

// --- EXAMINATION SELECTOR (Synced with Form) ---
const ExaminationSelector = ({ selectedItems, onChange, masterData }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedData = masterData.reduce((acc, item) => {
    const groupName = item.nama_instalasi
      ? item.nama_instalasi.toUpperCase()
      : "LAINNYA / UMUM";

    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});

  const sortedGroups = Object.entries(groupedData).sort((a, b) => {
    const groupA = a[0];
    const groupB = b[0];

    if (groupA === "LAINNYA / UMUM") return 1;
    if (groupB === "LAINNYA / UMUM") return -1;

    const kodeA = a[1][0]?.kode_sampel || "";
    const kodeB = b[1][0]?.kode_sampel || "";

    return kodeA.localeCompare(kodeB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const getItemQty = (id) => {
    const found = selectedItems.find((i) => Number(i.id) === Number(id));
    return found ? found.qty : 0;
  };

  const handleAdd = (item) => {
    const existing = selectedItems.find(
      (i) => Number(i.id) === Number(item.id),
    );
    if (existing) {
      onChange(
        selectedItems.map((i) =>
          Number(i.id) === Number(item.id) ? { ...i, qty: i.qty + 1 } : i,
        ),
      );
    } else {
      onChange([...selectedItems, { ...item, qty: 1 }]);
    }
  };

  const handleRemove = (item) => {
    const existing = selectedItems.find(
      (i) => Number(i.id) === Number(item.id),
    );
    if (existing) {
      if (existing.qty > 1) {
        onChange(
          selectedItems.map((i) =>
            Number(i.id) === Number(item.id) ? { ...i, qty: i.qty - 1 } : i,
          ),
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
        {sortedGroups.map(([groupName, items]) => {
          const filteredItems = items.filter((item) =>
            item.nama_pemeriksaan
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
          );
          if (filteredItems.length === 0) return null;
          return (
            <div key={groupName}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1 z-10">
                {groupName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                          {item.kode_sampel && (
                            <span className="ml-2 text-emerald-600 font-medium">
                              ({item.kode_sampel})
                            </span>
                          )}
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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State Master Data
  const [masterPemeriksaan, setMasterPemeriksaan] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalBiaya, setTotalBiaya] = useState(0);
  const isRestrictedMode = location.state?.restrictItems || false;

  // State Nomor Sampel
  const [baseSequence, setBaseSequence] = useState("");
  const [lastSampleString, setLastSampleString] = useState("");
  const [isSampleIdAvailable, setIsSampleIdAvailable] = useState(true);
  const [checkingSampleId, setCheckingSampleId] = useState(false);
  const [sampleIdMessage, setSampleIdMessage] = useState("");

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
    tgl_daftar: "",
    waktu_daftar: "",
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
        const [masterRes, seqRes, res] = await Promise.all([
          api.get("/master/pemeriksaan"),
          api.get("/registrations/next-sample-seq"),
          api.get(`/registrations/${id}`),
        ]);

        let masterList = [];
        if (masterRes.data.success) {
          masterList = masterRes.data.data;
          setMasterPemeriksaan(masterList);
        }

        if (seqRes.data.success) {
          setLastSampleString(seqRes.data.last_sample_string);
        }

        const data = res.data.data;
        const formatDate = (d) =>
          d ? new Date(d).toISOString().split("T")[0] : "";
        const formatTime = (t) => (t && t.length >= 5 ? t.substring(0, 5) : "");

        setForm({
          ...data,
          tgl_lahir: formatDate(data.tgl_lahir),
          tgl_daftar: formatDate(data.tgl_daftar),
          waktu_daftar: formatTime(data.waktu_daftar),
          tgl_pengambilan: formatDate(data.tgl_pengambilan),
          catatan_tambahan: data.catatan_tambahan || "",
          pengirim_instansi: data.pengirim_instansi || "",
          status_pembayaran: data.status_pembayaran || "berbayar",
          asal_sampel: data.asal_sampel || "Mandiri",
        });

        // Ekstrak baseSequence dari string nomor sampel yang sudah tersimpan
        if (data.no_sampel_lab) {
          const firstSample = data.no_sampel_lab.split(",")[0].trim();
          const parts = firstSample.split(" ");
          if (parts.length >= 3) {
            setBaseSequence(parts[parts.length - 3]);
          }
        }

        // Transform Details ke Selected Items
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
                kode_sampel: masterItem ? masterItem.kode_sampel : "",
              };
            }
            grouped[pid].qty += 1;
          });
          setSelectedItems(Object.values(grouped));
        } else if (data.pemeriksaan_ids) {
          const items = data.pemeriksaan_ids
            .map((itemId) => {
              const master = masterList.find((m) => m.id === Number(itemId));
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
        0,
      );
      setTotalBiaya(total);
    }
  }, [selectedItems, form.status_pembayaran]);

  // --- LOGIC PENOMORAN OTOMATIS BERDASARKAN BASE SEQUENCE ---
  const requiredInstallations = useMemo(() => {
    const codes = selectedItems
      .map((item) => item.kode_sampel || "UMUM")
      .filter(Boolean);
    const uniqueCodes = [...new Set(codes)];
    return uniqueCodes.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );
  }, [selectedItems]);

  useEffect(() => {
    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();

    if (requiredInstallations.length > 0 && baseSequence !== "") {
      const startNum = parseInt(baseSequence, 10) || 1;
      const parts = requiredInstallations.map((kode) => {
        return `${kode} ${startNum} ${bulan} ${tahun}`;
      });

      setForm((prev) => ({ ...prev, no_sampel_lab: parts.join(", ") }));
    } else {
      setForm((prev) => ({ ...prev, no_sampel_lab: "" }));
    }
  }, [baseSequence, requiredInstallations]);

  // --- CEK KETERSEDIAAN NOMOR SAMPEL (EXCLUDE CURRENT ID) ---
  useEffect(() => {
    const checkSampleId = async () => {
      const sampleId = form.no_sampel_lab?.trim();
      if (!sampleId) {
        setIsSampleIdAvailable(true);
        setSampleIdMessage("");
        return;
      }

      setCheckingSampleId(true);
      try {
        const safeId = encodeURIComponent(sampleId);
        // Penting: Kirim excludeId agar tidak bentrok dengan datanya sendiri!
        const res = await api.get(
          `/registrations/check-sample-no/${safeId}?excludeId=${id}`,
        );

        if (res.data.available) {
          setIsSampleIdAvailable(true);
          setSampleIdMessage("Semua nomor sampel tersedia ✅");
        } else {
          setIsSampleIdAvailable(false);
          setSampleIdMessage(
            "Terdapat nomor sampel yang bentrok/sudah digunakan ❌",
          );
        }
      } catch (error) {
        console.error("Gagal cek nomor sampel", error);
      } finally {
        setCheckingSampleId(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (form.no_sampel_lab) {
        checkSampleId();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [form.no_sampel_lab, id]);

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

  // Auto Calculate Age
  useEffect(() => {
    if (form.tgl_lahir) {
      const today = new Date();
      const birthDate = new Date(form.tgl_lahir);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm((prev) => ({ ...prev, umur: Math.max(age, 0) }));
    }
  }, [form.tgl_lahir]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSampleIdAvailable) {
      toast.error(
        "Nomor Sampel Lab sudah digunakan pasien lain! Ganti nomor urut start.",
      );
      return;
    }

    if (checkingSampleId) {
      toast.info("Sedang memverifikasi nomor sampel...");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Mohon pilih minimal satu jenis pemeriksaan");
      return;
    }

    setSaving(true);

    const {
      no_reg,
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

  // --- HELPER UNTUK HIGHLIGHT NOMOR TERAKHIR ---
  const renderHighlightedSequence = (str) => {
    if (
      !str ||
      str === "Belum ada data registrasi" ||
      str === "Error memuat data terakhir"
    ) {
      return str;
    }

    const samples = str.split(",").map((s) => s.trim());

    return samples.map((sample, sIndex) => {
      const parts = sample.split(" ");
      if (parts.length >= 3) {
        const seqIndex = parts.length - 3;
        return (
          <span key={sIndex}>
            {sIndex > 0 && ", "}
            {parts.map((part, pIndex) => (
              <span key={pIndex}>
                {pIndex === seqIndex ? (
                  <span className="text-black font-black mx-0.5">{part}</span>
                ) : (
                  <span className="text-yellow-900">{part}</span>
                )}
                {pIndex < parts.length - 1 && " "}
              </span>
            ))}
          </span>
        );
      }

      return (
        <span key={sIndex}>
          {sIndex > 0 && ", "}
          {sample}
        </span>
      );
    });
  };

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 animate-fade-in">
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
          {/* HEADER (Synced with form design) */}
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
            </div>

            <div className="flex flex-row items-end gap-3 p-2">
              <FormSelect
                label="Asal Sampel"
                name="asal_sampel"
                value={form.asal_sampel}
                onChange={handleAsalSampelChange}
              >
                <option value="Mandiri">Mandiri (Umum)</option>
                <option value="Rujukan">Rujukan (Faskes/RS)</option>
              </FormSelect>

              {form.asal_sampel === "Rujukan" && (
                <FormSelect
                  label="Status Pembayaran"
                  name="status_pembayaran"
                  value={form.status_pembayaran}
                  onChange={handleChange}
                >
                  <option value="berbayar">Berbayar</option>
                  <option value="gratis">Tidak Berbayar / Program</option>
                </FormSelect>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    Info Tambahan & Admin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Pengirim / Instansi"
                      name="pengirim_instansi"
                      value={form.pengirim_instansi}
                      onChange={handleChange}
                      placeholder="Nama Dokter / RS / Klinik"
                      icon={Building2}
                    />
                    <FormInput
                      label="Tgl Daftar"
                      type="date"
                      name="tgl_daftar"
                      value={form.tgl_daftar}
                      onChange={handleChange}
                      icon={CalendarDays}
                    />
                    <FormInput
                      label="Jam Daftar"
                      type="time"
                      name="waktu_daftar"
                      value={form.waktu_daftar}
                      onChange={handleChange}
                      icon={Clock}
                    />
                    <div className="md:col-span-2">
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
              </div>

              {/* PANEL PEMERIKSAAN & KONFIGURASI NOMOR SAMPEL */}
              <div className="lg:col-span-2 h-full flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                    Item Pemeriksaan
                  </h3>

                  {isRestrictedMode ? (
                    /* MODE READ-ONLY (Jika dari Data Management) */
                    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 h-full">
                      <div className="mb-4 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-medium border border-blue-100 flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>
                          Anda sedang berada di mode Manajemen Data Akhir.
                          Penambahan atau pengurangan item uji, serta perubahan
                          nomor sampel sudah dikunci. Anda hanya bisa mengubah
                          data identitas pasien.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {selectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                {item.nama_pemeriksaan}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {formatRupiah(item.harga)}
                              </p>
                            </div>
                            <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs font-bold border border-cyan-200">
                              Qty: {item.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* MODE EDIT FULL (Jika dari Pendaftaran Awal) */
                    <ExaminationSelector
                      masterData={masterPemeriksaan}
                      selectedItems={selectedItems}
                      onChange={setSelectedItems}
                    />
                  )}
                </div>

                {/* --- PANEL KONFIGURASI NOMOR SAMPEL (Synced with form) --- */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                  <div
                    className={`space-y-3 bg-white p-4 border border-gray-200 rounded-xl shadow-sm ${isRestrictedMode ? "opacity-70 pointer-events-none" : ""}`}
                  >
                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Settings2 size={16} className="text-cyan-600" />
                      Konfigurasi Nomor Sampel
                    </label>

                    {/* INFO NOMOR TERAKHIR DATABASE */}
                    <div className="bg-yellow-50/80 border border-yellow-200 rounded-lg p-2.5 mb-2 shadow-sm">
                      <p className="text-[10px] text-yellow-700 font-bold uppercase mb-0.5">
                        Riwayat Nomor Terakhir Database:
                      </p>
                      <p className="text-xs font-mono font-medium wrap-break-word leading-tight items-center flex flex-wrap">
                        {renderHighlightedSequence(lastSampleString)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Edit Nomor Urut (Base Sequence)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        disabled={isRestrictedMode} // Matikan input jika di mode akhir
                        className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 outline-none text-sm font-bold ${isRestrictedMode ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                        value={baseSequence}
                        onChange={(e) =>
                          setBaseSequence(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Angka urut..."
                      />
                    </div>
                    {requiredInstallations.length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500 text-center italic">
                        Pilih item untuk preview nomor
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <p className="text-[11px] font-medium text-gray-500">
                          Preview {requiredInstallations.length} Tabung/Sampel
                          Fisik:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {requiredInstallations.map((kode) => {
                            const startNum = parseInt(baseSequence, 10) || 1;
                            return (
                              <div
                                key={kode}
                                className="bg-cyan-50 border border-cyan-200 text-cyan-800 px-3 py-1.5 rounded-md text-xs font-bold font-mono shadow-sm"
                              >
                                {kode}{" "}
                                <span className="text-cyan-600">
                                  {startNum}
                                </span>{" "}
                                {new Date().getMonth() + 1}{" "}
                                {new Date().getFullYear()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Validation Message */}
                    {form.no_sampel_lab && (
                      <div className="flex flex-col mt-2 pt-2 border-t border-gray-100">
                        <span
                          className={`text-xs font-medium flex items-center gap-1 ${
                            isSampleIdAvailable
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {checkingSampleId
                            ? "Memeriksa ketersediaan DB..."
                            : sampleIdMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM BAR ACTION */}
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
                      {selectedItems.map((item) => (
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
                  disabled={saving || !isSampleIdAvailable}
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
