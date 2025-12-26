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
} from "lucide-react";

export default function MasterPemeriksaan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State UI Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  // [MODIFIKASI 1] Ubah state itemsPerPage agar bisa di-set (default 10)
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: "nama_pemeriksaan",
    direction: "asc",
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    kategori: "",
    nama_pemeriksaan: "",
    satuan: "",
    harga: "",
  });

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

  // --- LOGIC: FILTER & SORTING ---

  const categories = useMemo(() => {
    const cats = data.map((item) => item.kategori).filter(Boolean);
    return ["Semua", ...new Set(cats)];
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = data;

    // Filter by Category
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((item) => item.kategori === selectedCategory);
    }

    // Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nama_pemeriksaan.toLowerCase().includes(lowerTerm) ||
          item.kategori.toLowerCase().includes(lowerTerm)
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, selectedCategory, searchTerm, sortConfig]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

  // --- HANDLERS ---

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // [MODIFIKASI 2] Handler untuk mengubah jumlah baris
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset ke halaman 1 agar UX lebih baik
  };

  // --- NEW: FORMATTER HARGA INPUT ---
  const handlePriceChange = (e) => {
    // Ambil value, hapus semua karakter selain angka
    let val = e.target.value.replaceAll(/\D/g, "");
    setFormData({ ...formData, harga: val });
  };

  const getFormattedPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("id-ID").format(price);
  };
  // ----------------------------------

  const handleAddNew = () => {
    setIsEditing(false);
    const prefilledCategory =
      selectedCategory === "Semua" ? "" : selectedCategory;

    setFormData({
      id: null,
      kategori: prefilledCategory,
      nama_pemeriksaan: "",
      satuan: "",
      harga: "",
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kategori: item.kategori,
      nama_pemeriksaan: item.nama_pemeriksaan,
      satuan: item.satuan,
      harga: item.harga,
    });
    setShowModal(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/master/pemeriksaan/${formData.id}`, formData);
        toast.success("Data berhasil diperbarui");
      } else {
        await api.post("/master/pemeriksaan", formData);
        toast.success("Data berhasil ditambahkan");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatRupiahDisplay = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

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
          {/* Search Bar */}
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
                setCurrentPage(1); // Reset ke halaman 1 saat search
              }}
            />
          </div>
        </div>

        {/* Categories Tabs */}
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
                <th className="px-6 py-4">Satuan</th>
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
                    colSpan="5"
                    className="text-center py-12 text-gray-400 flex flex-col items-center"
                  >
                    <Loader2 className="animate-spin mb-2" /> Memuat data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.satuan}</td>
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

        {/* [MODIFIKASI 3] Pagination Footer yang Diperbarui */}
        {processedData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            {/* Bagian Kiri: Info Data & Selector Rows */}
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
                  onChange={handleItemsPerPageChange}
                  className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Bagian Kanan: Navigasi Page */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Logic Page Indicator (Keep Simple or Full) */}
              <div className="flex gap-1 hidden sm:flex">
                {[...Array(totalPages)].map((_, i) => {
                  // Logic agar tidak menampilkan semua angka jika halamannya banyak
                  if (
                    totalPages > 5 &&
                    i !== 0 &&
                    i !== totalPages - 1 &&
                    (i < currentPage - 2 || i > currentPage)
                  ) {
                    if (i === currentPage - 3 || i === currentPage + 1)
                      return (
                        <span key={i} className="px-1 text-gray-400">
                          .
                        </span>
                      );
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        currentPage === i + 1
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-200"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {isEditing ? "Edit Data Pemeriksaan" : "Tambah Data Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form
                id="masterForm"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Kategori Input */}
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
                      placeholder="Pilih atau ketik kategori baru..."
                    />
                    <datalist id="kategori-list">
                      {categories
                        .filter((c) => c !== "Semua")
                        .map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                    </datalist>
                  </div>
                  <p className="text-[10px] text-gray-400 ml-1">
                    Tips: Ketik nama kategori baru untuk menambah grup baru.
                  </p>
                </div>

                {/* Nama Pemeriksaan */}
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
                    placeholder="Contoh: Glukosa Puasa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Satuan */}
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

                  {/* Harga (AUTO FORMAT RIBUAN) */}
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
              </form>
            </div>

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
                className="flex-1 py-3 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-200 transition flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
