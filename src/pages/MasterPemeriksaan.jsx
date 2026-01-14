import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Database,
  X,
  Save,
  Loader2,
  Tag,
  Beaker,
  DollarSign,
  Scale,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  Package,
  Minus,
  Activity,
  ClipboardList,
} from "lucide-react";

export default function MasterPemeriksaan() {
  // --- STATE DATA UTAMA ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE UI CONTROLS (Filter, Sort, Pagination) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "nama_pemeriksaan",
    direction: "asc",
  });

  // --- MODAL & FORM STATE ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form Data (Gabungan Logic Baru ke dalam State Lama)
  const [formData, setFormData] = useState({
    id: null,
    tipe: "tunggal", // 'tunggal' | 'paket'
    kategori: "",
    nama_pemeriksaan: "",
    harga: "",
    // Field khusus Tunggal
    satuan: "",
    nilai_rujukan: "",
    metode: "",
  });

  // State khusus untuk Parameters (Logic Paket)
  const [parameters, setParameters] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/pemeriksaan");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pemeriksaan");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: FILTER & SORTING (Sama seperti kode lama) ---
  const categories = useMemo(() => {
    const cats = data.map((item) => item.kategori).filter(Boolean);
    return ["Semua", ...new Set(cats)];
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = data;

    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((item) => item.kategori === selectedCategory);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nama_pemeriksaan.toLowerCase().includes(lowerTerm) ||
          item.kategori.toLowerCase().includes(lowerTerm)
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle sorting for possibly nested or missing keys safely
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, selectedCategory, searchTerm, sortConfig]);

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

  // --- HELPER FORMATTER ---
  const handlePriceChange = (e) => {
    let val = e.target.value.replaceAll(/\D/g, "");
    setFormData({ ...formData, harga: val });
  };

  const getFormattedPrice = (price) => {
    if (!price && price !== 0) return "";
    return new Intl.NumberFormat("id-ID").format(price);
  };

  const formatRupiahDisplay = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  // --- HANDLERS PARAMETER (LOGIC BARU) ---
  const addParameter = () => {
    setParameters([
      ...parameters,
      { parameter_name: "", satuan: "", nilai_rujukan: "", metode: "" },
    ]);
  };

  const updateParameter = (index, field, value) => {
    const newParams = [...parameters];
    newParams[index][field] = value;
    setParameters(newParams);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  // --- HANDLERS UTAMA ---
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddNew = () => {
    setIsEditing(false);
    const prefilledCategory =
      selectedCategory === "Semua" ? "" : selectedCategory;

    setFormData({
      id: null,
      tipe: "tunggal",
      kategori: prefilledCategory,
      nama_pemeriksaan: "",
      harga: "",
      satuan: "",
      nilai_rujukan: "",
      metode: "",
    });
    setParameters([]);
    setShowModal(true);
  };

  const handleEdit = async (item) => {
    // 1. Tampilkan loading sebentar (opsional) atau langsung fetch
    try {
      // Kita ambil data detail yang LENGKAP dari backend (termasuk array parameters)
      const res = await api.get(`/master/pemeriksaan/${item.id}/detail`);

      if (res.data.success) {
        const fullData = res.data.data;

        setIsEditing(true);

        // 2. Set Form Data Utama
        setFormData({
          id: fullData.id,
          tipe: fullData.tipe || "tunggal",
          kategori: fullData.kategori,
          nama_pemeriksaan: fullData.nama_pemeriksaan,
          harga: fullData.harga,
          satuan: fullData.satuan || "",
          nilai_rujukan: fullData.nilai_rujukan || "",
          metode: fullData.metode || "",
        });

        // 3. Set Parameters (Ini kuncinya)
        // Backend kamu mengembalikan array parameters di sini
        if (fullData.tipe === "paket" && fullData.parameters) {
          setParameters(fullData.parameters);
        } else {
          setParameters([]);
        }

        // 4. Buka Modal
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil detail parameter pemeriksaan");
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Yakin ingin menghapus "${nama}"?`)) return;
    try {
      await api.delete(`/master/pemeriksaan/${id}`);
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menghapus data";
      toast.error(msg);
    }
  };

  // MasterPemeriksaan.jsx - FUNGSI YANG BENAR (PENGGANTI)
  // MasterPemeriksaan.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Persiapan Payload
    const payload = {
      ...formData,
      parameters: formData.tipe === "paket" ? parameters : [],
    };

    // Validasi Paket
    if (formData.tipe === "paket") {
      if (parameters.length === 0) {
        toast.error("Paket pemeriksaan harus memiliki minimal 1 parameter");
        setSubmitLoading(false);
        return;
      }
    }

    try {
      if (isEditing) {
        // PERBAIKAN DISINI: Tambahkan '/with-parameters' pada URL
        await api.put(
          `/master/pemeriksaan/${formData.id}/with-parameters`,
          payload
        );
        toast.success("Data berhasil diperbarui");
      } else {
        // Create juga menggunakan endpoint with-parameters
        await api.post("/master/pemeriksaan/with-parameters", payload);
        toast.success("Data berhasil ditambahkan");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error); // Log error agar terlihat di console
      toast.error(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-cyan-600" /> Master Pemeriksaan
          </h2>
          <p className="text-gray-500 text-sm">
            Total {data.length} item layanan dalam {categories.length - 1}{" "}
            kategori.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-cyan-200 hover:shadow-cyan-300 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Item Baru
        </button>
      </div>

      {/* --- FILTER & TABS AREA --- */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 pb-0">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama pemeriksaan atau kategori..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-4 custom-scrollbar">
          <Filter size={16} className="text-gray-400 shrink-0 mr-2" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                selectedCategory === cat
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("nama_pemeriksaan")}
                >
                  <div className="flex items-center gap-2">
                    Nama Pemeriksaan
                    <ArrowUpDown
                      size={14}
                      className="text-gray-400 group-hover:text-cyan-600"
                    />
                  </div>
                </th>
                <th className="px-6 py-4">Tipe</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("kategori")}
                >
                  <div className="flex items-center gap-2">
                    Kategori
                    <ArrowUpDown
                      size={14}
                      className="text-gray-400 group-hover:text-cyan-600"
                    />
                  </div>
                </th>
                <th className="px-6 py-4">Satuan / Info</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("harga")}
                >
                  <div className="flex items-center gap-2">
                    Harga
                    <ArrowUpDown
                      size={14}
                      className="text-gray-400 group-hover:text-cyan-600"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-gray-400 flex flex-col items-center"
                  >
                    <Loader2 className="animate-spin mb-2" /> Memuat data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-cyan-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {item.nama_pemeriksaan}
                    </td>
                    <td className="px-6 py-4">
                      {item.tipe === "paket" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <Package size={12} /> Paket
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <FileText size={12} /> Tunggal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.tipe === "paket" ? (
                        <span className="italic text-gray-400 text-xs">
                          {/* Ganti item.parameters?.length menjadi item.total_parameters */}
                          {item.total_parameters || 0} parameter
                        </span>
                      ) : (
                        item.satuan || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-cyan-700">
                      {formatRupiahDisplay(item.harga)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-yellow-200"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(item.id, item.nama_pemeriksaan)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {processedData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                Menampilkan {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, processedData.length)} dari{" "}
                {processedData.length} data
              </span>
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <span>Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Simple Page Indicator */}
              <span className="text-sm font-medium text-gray-600 px-2">
                Halaman {currentPage}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                {isEditing ? (
                  <Edit2 size={18} className="text-cyan-600" />
                ) : (
                  <Plus size={18} className="text-cyan-600" />
                )}
                {isEditing ? "Edit Data Pemeriksaan" : "Tambah Data Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form
                id="masterForm"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* 1. Selection Tipe (Logic Baru dengan Style Lama) */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setFormData({ ...formData, tipe: "tunggal" })
                    }
                    className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${
                      formData.tipe === "tunggal"
                        ? "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        formData.tipe === "tunggal"
                          ? "bg-cyan-200 text-cyan-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${
                          formData.tipe === "tunggal"
                            ? "text-cyan-800"
                            : "text-gray-700"
                        }`}
                      >
                        Pemeriksaan Tunggal
                      </p>
                      <p className="text-xs text-gray-500">
                        Satu jenis parameter hasil
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, tipe: "paket" })}
                    className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${
                      formData.tipe === "paket"
                        ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        formData.tipe === "paket"
                          ? "bg-purple-200 text-purple-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Package size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${
                          formData.tipe === "paket"
                            ? "text-purple-800"
                            : "text-gray-700"
                        }`}
                      >
                        Paket Pemeriksaan
                      </p>
                      <p className="text-xs text-gray-500">
                        Terdiri dari banyak parameter
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                {/* 2. Common Fields (Nama, Kategori, Harga) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Tag size={16} className="text-cyan-600" /> Kategori
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="kategori-list"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                        value={formData.kategori}
                        onChange={(e) =>
                          setFormData({ ...formData, kategori: e.target.value })
                        }
                        placeholder="Pilih atau ketik..."
                      />
                      <datalist id="kategori-list">
                        {categories
                          .filter((c) => c !== "Semua")
                          .map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <DollarSign size={16} className="text-cyan-600" /> Harga
                      (Rp)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm font-mono"
                      value={getFormattedPrice(formData.harga)}
                      onChange={handlePriceChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Beaker size={16} className="text-cyan-600" /> Nama
                    Pemeriksaan
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                    value={formData.nama_pemeriksaan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_pemeriksaan: e.target.value,
                      })
                    }
                    placeholder={
                      formData.tipe === "paket"
                        ? "Contoh: Paket Medical Checkup A"
                        : "Contoh: Glukosa Puasa"
                    }
                  />
                </div>

                {/* 3. Conditional Rendering based on Tipe */}
                {formData.tipe === "tunggal" ? (
                  /* --- Form Tunggal --- */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Scale size={16} className="text-cyan-600" /> Satuan
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                        value={formData.satuan}
                        onChange={(e) =>
                          setFormData({ ...formData, satuan: e.target.value })
                        }
                        placeholder="mg/dL"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-600" /> Nilai
                        Rujukan
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                        value={formData.nilai_rujukan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nilai_rujukan: e.target.value,
                          })
                        }
                        placeholder="< 200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ClipboardList size={16} className="text-cyan-600" />{" "}
                        Metode
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                        value={formData.metode}
                        onChange={(e) =>
                          setFormData({ ...formData, metode: e.target.value })
                        }
                        placeholder="Hexokinase"
                      />
                    </div>
                  </div>
                ) : (
                  /* --- Form Paket (Dynamic Parameters) --- */
                  <div className="space-y-3 animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {/* HILANGKAN INPUT SATUAN/NILAI_RUJUKAN/METODE LEVEL MASTER UNTUK PAKET */}
                    <p className="text-xs text-gray-500 mb-3">
                      Untuk pemeriksaan paket, satuan, nilai rujukan, dan metode
                      diatur per parameter di bawah.
                    </p>

                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Package size={16} className="text-purple-600" /> Daftar
                        Parameter Paket
                      </label>
                      <button
                        type="button"
                        onClick={addParameter}
                        className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium transition"
                      >
                        <Plus size={12} /> Tambah Parameter
                      </button>
                    </div>

                    {parameters.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                        <p className="text-sm">Belum ada parameter.</p>
                        <button
                          type="button"
                          onClick={addParameter}
                          className="text-xs text-purple-600 underline mt-1"
                        >
                          Klik untuk tambah
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {parameters.map((param, index) => (
                          <div
                            key={index}
                            className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative group"
                          >
                            <button
                              type="button"
                              onClick={() => removeParameter(index)}
                              className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            >
                              <Minus size={14} />
                            </button>

                            <div className="pr-8">
                              <input
                                type="text"
                                placeholder="Nama Parameter (Wajib)"
                                className="w-full px-3 py-2 text-sm border-b border-gray-200 focus:border-purple-500 outline-none font-medium mb-2"
                                value={param.parameter_name}
                                onChange={(e) =>
                                  updateParameter(
                                    index,
                                    "parameter_name",
                                    e.target.value
                                  )
                                }
                                required
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="Satuan"
                                  className="px-3 py-1.5 text-xs bg-gray-50 rounded border border-gray-200 focus:border-purple-300 outline-none"
                                  value={param.satuan}
                                  onChange={(e) =>
                                    updateParameter(
                                      index,
                                      "satuan",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="text"
                                  placeholder="Nilai Rujukan"
                                  className="px-3 py-1.5 text-xs bg-gray-50 rounded border border-gray-200 focus:border-purple-300 outline-none"
                                  value={param.nilai_rujukan}
                                  onChange={(e) =>
                                    updateParameter(
                                      index,
                                      "nilai_rujukan",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="text"
                                  placeholder="Metode"
                                  className="px-3 py-1.5 text-xs bg-gray-50 rounded border border-gray-200 focus:border-purple-300 outline-none"
                                  value={param.metode}
                                  onChange={(e) =>
                                    updateParameter(
                                      index,
                                      "metode",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-white transition"
              >
                Batal
              </button>
              <button
                type="submit"
                form="masterForm"
                disabled={submitLoading}
                className={`flex-1 py-3 rounded-xl text-white font-bold hover:shadow-lg transition flex items-center justify-center gap-2 ${
                  formData.tipe === "paket"
                    ? "bg-linear-to-r from-purple-600 to-indigo-600 hover:shadow-purple-200"
                    : "bg-linear-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-200"
                }`}
              >
                {submitLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Simpan {formData.tipe === "paket" ? "Paket" : "Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
