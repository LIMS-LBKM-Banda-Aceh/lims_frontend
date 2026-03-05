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
  AlertCircle,
  Building2,
} from "lucide-react";

export default function MasterPemeriksaan() {
  const [data, setData] = useState([]);
  const [instalasiList, setInstalasiList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  // STATE DIUBAH: Menyimpan ID instalasi, string kosong "" berarti "Semua"
  const [selectedInstalasiFilter, setSelectedInstalasiFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "nama_pemeriksaan",
    direction: "asc",
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- STATE INSTALASI BARU ---
  const [showInstalasiModal, setShowInstalasiModal] = useState(false);
  const [isEditingInstalasi, setIsEditingInstalasi] = useState(false);
  const [instalasiLoading, setInstalasiLoading] = useState(false);
  const [instalasiForm, setInstalasiForm] = useState({
    id: null,
    kode_instalasi: "",
    nama_instalasi: "",
    kode_sampel: "",
  });
  // ----------------------------

  const [formData, setFormData] = useState({
    id: null,
    tipe: "tunggal",
    instalasi_id: "",
    kategori: "",
    nama_pemeriksaan: "",
    harga: "",
    satuan: "",
    nilai_rujukan: "",
    metode: "",
  });

  const [parameters, setParameters] = useState([]);

  useEffect(() => {
    fetchData();
    fetchInstalasi();
  }, []);

  const fetchInstalasi = async () => {
    try {
      const res = await api.get("/master/instalasi");
      if (res.data.success) setInstalasiList(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data instalasi", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/pemeriksaan");
      if (res.data.success) setData(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pemeriksaan");
    } finally {
      setLoading(false);
    }
  };

  const activeInstalasiFilters = useMemo(() => {
    const activeIds = [
      ...new Set(data.map((item) => item.instalasi_id).filter(Boolean)),
    ];

    let filters = activeIds
      .map((id) => {
        const inst = instalasiList.find((i) => i.id === id);
        return inst;
      })
      .filter(Boolean);

    filters.sort((a, b) => {
      if (!a.kode_sampel) return 1;
      if (!b.kode_sampel) return -1;
      return a.kode_sampel.localeCompare(b.kode_sampel, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return filters;
  }, [data, instalasiList]);

  const categoriesList = useMemo(() => {
    const cats = data.map((item) => item.kategori).filter(Boolean);
    return [...new Set(cats)];
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = data;

    if (selectedInstalasiFilter !== "") {
      filtered = filtered.filter(
        (item) => item.instalasi_id === selectedInstalasiFilter,
      );
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nama_pemeriksaan.toLowerCase().includes(lowerTerm) ||
          item.kategori.toLowerCase().includes(lowerTerm) ||
          (item.nama_instalasi &&
            item.nama_instalasi.toLowerCase().includes(lowerTerm)) ||
          (item.metode && item.metode.toLowerCase().includes(lowerTerm)) ||
          (item.nilai_rujukan &&
            item.nilai_rujukan.toLowerCase().includes(lowerTerm)),
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, selectedInstalasiFilter, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

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

  const addParameter = () =>
    setParameters([
      ...parameters,
      { parameter_name: "", satuan: "", nilai_rujukan: "", metode: "" },
    ]);
  const updateParameter = (index, field, value) => {
    const newParams = [...parameters];
    newParams[index][field] = value;
    setParameters(newParams);
  };
  const removeParameter = (index) =>
    setParameters(parameters.filter((_, i) => i !== index));

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const handleAddNew = () => {
    setIsEditing(false);

    const prefilledInstalasiId =
      selectedInstalasiFilter === "Semua"
        ? ""
        : instalasiList.find((i) => i.id === selectedInstalasiFilter)?.id || "";

    setFormData({
      id: null,
      tipe: "tunggal",
      instalasi_id: prefilledInstalasiId,
      kategori: "",
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
    try {
      const res = await api.get(`/master/pemeriksaan/${item.id}/detail`);
      if (res.data.success) {
        const fullData = res.data.data;
        setIsEditing(true);
        setFormData({
          id: fullData.id,
          tipe: fullData.tipe || "tunggal",
          instalasi_id: fullData.instalasi_id || "",
          kategori: fullData.kategori,
          nama_pemeriksaan: fullData.nama_pemeriksaan,
          harga: fullData.harga,
          satuan: fullData.satuan || "",
          nilai_rujukan: fullData.nilai_rujukan || "",
          metode: fullData.metode || "",
        });
        if (fullData.tipe === "paket" && fullData.parameters) {
          setParameters(fullData.parameters);
        } else {
          setParameters([]);
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      ...formData,
      parameters: formData.tipe === "paket" ? parameters : [],
    };

    if (formData.tipe === "paket" && parameters.length === 0) {
      toast.error("Paket pemeriksaan harus memiliki minimal 1 parameter");
      setSubmitLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await api.put(
          `/master/pemeriksaan/${formData.id}/with-parameters`,
          payload,
        );
        toast.success("Data berhasil diperbarui");
      } else {
        await api.post("/master/pemeriksaan/with-parameters", payload);
        toast.success("Data berhasil ditambahkan");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditInstalasiBtn = () => {
    if (!formData.instalasi_id) return;
    const inst = instalasiList.find((i) => i.id == formData.instalasi_id);
    if (inst) {
      setInstalasiForm({
        id: inst.id,
        kode_instalasi: inst.kode_instalasi,
        nama_instalasi: inst.nama_instalasi,
        kode_sampel: inst.kode_sampel,
      });
      setIsEditingInstalasi(true);
      setShowInstalasiModal(true);
    }
  };

  const handleDeleteInstalasiBtn = async () => {
    if (!formData.instalasi_id) return;
    const inst = instalasiList.find((i) => i.id == formData.instalasi_id);
    if (!confirm(`Yakin ingin menghapus instalasi "${inst?.nama_instalasi}"?`))
      return;

    try {
      await api.delete(`/master/instalasi/${formData.instalasi_id}`);
      toast.success("Instalasi berhasil dihapus");
      setFormData((prev) => ({ ...prev, instalasi_id: "" }));

      if (selectedInstalasiFilter === formData.instalasi_id) {
        setSelectedInstalasiFilter("");
      }

      fetchInstalasi();
      fetchData();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Gagal menghapus data instalasi";
      toast.error(msg);
    }
  };

  const handleInstalasiSubmit = async (e) => {
    e.preventDefault();
    setInstalasiLoading(true);
    try {
      let res;
      if (isEditingInstalasi) {
        res = await api.put(
          `/master/instalasi/${instalasiForm.id}`,
          instalasiForm,
        );
      } else {
        res = await api.post("/master/instalasi", instalasiForm);
      }

      if (res.data.success) {
        toast.success(
          isEditingInstalasi
            ? "Instalasi berhasil diperbarui!"
            : "Instalasi baru berhasil ditambahkan!",
        );
        setShowInstalasiModal(false);
        setInstalasiForm({
          id: null,
          kode_instalasi: "",
          nama_instalasi: "",
          kode_sampel: "",
        });
        setIsEditingInstalasi(false);

        await fetchInstalasi();
        await fetchData();

        if (!isEditingInstalasi) {
          setFormData((prev) => ({ ...prev, instalasi_id: res.data.data.id }));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Gagal menyimpan data instalasi",
      );
    } finally {
      setInstalasiLoading(false);
    }
  };

  // --- REFACTOR UI/UX RENDER HELPERS ---
  const renderNilaiRujukan = (item) => {
    if (item.tipe === "paket") {
      return (
        <div className="flex items-center gap-1 text-gray-400">
          <Package size={12} />{" "}
          <span className="text-xs italic">Multi nilai</span>
        </div>
      );
    }
    return item.nilai_rujukan ? (
      <div className="max-w-[150px]" title={item.nilai_rujukan}>
        <span className="text-[13px] text-gray-700 line-clamp-2 break-words">
          {item.nilai_rujukan}
        </span>
      </div>
    ) : (
      <span className="text-gray-400 text-sm">-</span>
    );
  };

  const renderMetode = (item) => {
    if (item.tipe === "paket") {
      return (
        <div className="flex items-center gap-1 text-gray-400">
          <AlertCircle size={12} />{" "}
          <span className="text-xs italic">Beragam</span>
        </div>
      );
    }
    return item.metode ? (
      <div className="max-w-[150px]" title={item.metode}>
        <span className="text-[13px] text-gray-700 line-clamp-2 break-words">
          {item.metode}
        </span>
      </div>
    ) : (
      <span className="text-gray-400 text-sm">-</span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-cyan-600" /> Master Pemeriksaan
          </h2>
          <p className="text-gray-500 text-sm">
            Total {data.length} item layanan dalam{" "}
            {activeInstalasiFilters.length} instalasi.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-cyan-200 hover:shadow-cyan-300 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Item Baru
        </button>
      </div>

      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 pb-0">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari nama pemeriksaan, kategori, instalasi, atau metode..."
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
          <button
            onClick={() => {
              setSelectedInstalasiFilter("");
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              selectedInstalasiFilter === ""
                ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            SEMUA
          </button>

          {activeInstalasiFilters.map((inst) => (
            <button
              key={inst.id}
              onClick={() => {
                setSelectedInstalasiFilter(inst.id);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                selectedInstalasiFilter === inst.id
                  ? "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${selectedInstalasiFilter === inst.id ? "bg-cyan-200 text-cyan-800" : "bg-gray-100 text-gray-500"}`}
              >
                {inst.kode_sampel}
              </span>
              {inst.nama_instalasi.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                {/* REFACTOR UI/UX THEAD: px-4 untuk hemat ruang dan tambah table head Metode */}
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors group min-w-[200px]"
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
                <th className="px-4 py-4 min-w-[100px]">Tipe</th>
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors group min-w-[120px]"
                  onClick={() => handleSort("nama_instalasi")}
                >
                  <div className="flex items-center gap-2">
                    Instalasi
                    <ArrowUpDown
                      size={14}
                      className="text-gray-400 group-hover:text-cyan-600"
                    />
                  </div>
                </th>
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors group min-w-[150px]"
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
                <th className="px-4 py-4 min-w-[100px]">Satuan / Info</th>
                <th className="px-4 py-4 min-w-[140px]">Nilai Rujukan</th>
                <th className="px-4 py-4 min-w-[140px]">Metode</th>{" "}
                {/* TABEL BARU METODE */}
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors group min-w-[120px]"
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
                <th className="px-4 py-4 text-center min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-12 text-gray-400 flex flex-col items-center"
                  >
                    <Loader2 className="animate-spin mb-2" /> Memuat data...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-400">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-cyan-50/30 transition-colors"
                  >
                    {/* REFACTOR UI/UX TBODY: align-top & penyesuaian px-4 py-3 */}
                    <td className="px-4 py-3 align-top">
                      <div
                        className="font-bold text-gray-800 line-clamp-2 max-w-[200px]"
                        title={item.nama_pemeriksaan}
                      >
                        {item.nama_pemeriksaan}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
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
                    <td className="px-4 py-3 align-top">
                      {item.nama_instalasi ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap"
                          title={item.nama_instalasi}
                        >
                          {item.kode_sampel}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {/* FIX UI/UX KATEGORI PANJANG */}
                      <div
                        className="inline-block px-2 py-1 rounded text-[10px] sm:text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 max-w-[160px] whitespace-normal break-words leading-tight"
                        title={item.kategori}
                      >
                        <span className="line-clamp-2">{item.kategori}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {item.tipe === "paket" ? (
                        <span className="text-gray-500 text-xs">
                          {item.total_parameters || 0} param
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-700">
                          <Scale size={12} className="shrink-0" />{" "}
                          <span className="text-[13px]">
                            {item.satuan || "-"}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {renderNilaiRujukan(item)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {renderMetode(item)}
                    </td>{" "}
                    {/* RENDER METODE DISINI */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono font-medium text-[13px] text-cyan-700 whitespace-nowrap">
                        {formatRupiahDisplay(item.harga)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-yellow-200"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(item.id, item.nama_pemeriksaan)
                          }
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form
                id="masterForm"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() =>
                      setFormData({ ...formData, tipe: "tunggal" })
                    }
                    className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.tipe === "tunggal" ? "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-500" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                  >
                    <div
                      className={`p-2 rounded-full ${formData.tipe === "tunggal" ? "bg-cyan-200 text-cyan-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${formData.tipe === "tunggal" ? "text-cyan-800" : "text-gray-700"}`}
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
                    className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.tipe === "paket" ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                  >
                    <div
                      className={`p-2 rounded-full ${formData.tipe === "paket" ? "bg-purple-200 text-purple-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      <Package size={20} />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${formData.tipe === "paket" ? "text-purple-800" : "text-gray-700"}`}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building2 size={16} className="text-cyan-600" />{" "}
                        Instalasi
                      </label>
                      <div className="flex items-center gap-1">
                        {formData.instalasi_id && (
                          <>
                            <button
                              type="button"
                              onClick={handleEditInstalasiBtn}
                              className="text-xs text-yellow-600 hover:bg-yellow-50 p-1.5 rounded-lg transition"
                              title="Edit Instalasi Terpilih"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteInstalasiBtn}
                              className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Hapus Instalasi Terpilih"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingInstalasi(false);
                            setInstalasiForm({
                              id: null,
                              kode_instalasi: "",
                              nama_instalasi: "",
                              kode_sampel: "",
                            });
                            setShowInstalasiModal(true);
                          }}
                          className="text-xs bg-cyan-100 text-cyan-700 px-2.5 py-1 rounded-lg hover:bg-cyan-200 transition font-bold"
                        >
                          + Tambah Baru
                        </button>
                      </div>
                    </div>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                      value={formData.instalasi_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instalasi_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Pilih Instalasi --</option>
                      {instalasiList.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.kode_sampel} - {inst.nama_instalasi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mt-1 md:mt-0">
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
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {formData.tipe === "tunggal" ? (
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
                  <div className="space-y-3 animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-200">
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
                                    e.target.value,
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
                                      e.target.value,
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
                                      e.target.value,
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
                                      e.target.value,
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
                className={`flex-1 py-3 rounded-xl text-white font-bold hover:shadow-lg transition flex items-center justify-center gap-2 ${formData.tipe === "paket" ? "bg-linear-to-r from-purple-600 to-indigo-600 hover:shadow-purple-200" : "bg-linear-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-200"}`}
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

      {/* --- MODAL TAMBAH/EDIT INSTALASI BARU (Z-INDEX 60) --- */}
      {showInstalasiModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                {isEditingInstalasi ? (
                  <Edit2 size={18} className="text-cyan-600" />
                ) : (
                  <Building2 size={18} className="text-cyan-600" />
                )}
                {isEditingInstalasi
                  ? "Edit Instalasi"
                  : "Tambah Instalasi Baru"}
              </h3>
              <button
                onClick={() => setShowInstalasiModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInstalasiSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Kode Instalasi (Opsional/Internal)
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                    value={instalasiForm.kode_instalasi}
                    onChange={(e) =>
                      setInstalasiForm({
                        ...instalasiForm,
                        kode_instalasi: e.target.value,
                      })
                    }
                    placeholder="Contoh: 04"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Nama Instalasi Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                    value={instalasiForm.nama_instalasi}
                    onChange={(e) =>
                      setInstalasiForm({
                        ...instalasiForm,
                        nama_instalasi: e.target.value,
                      })
                    }
                    placeholder="Contoh: Instalasi Radiologi Khusus"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Kode Sampel/Penomoran
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                    value={instalasiForm.kode_sampel}
                    onChange={(e) =>
                      setInstalasiForm({
                        ...instalasiForm,
                        kode_sampel: e.target.value,
                      })
                    }
                    placeholder="Contoh: 4 IRK"
                  />
                  <p className="text-[11px] text-gray-500">
                    Ini akan digunakan sebagai prefix penomoran sampel di
                    Registrasi (Contoh hasil: 4 IRK 1 2 2026).
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowInstalasiModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={instalasiLoading}
                  className={`flex-1 py-3 rounded-xl text-white font-bold hover:shadow-lg transition flex items-center justify-center gap-2 ${isEditingInstalasi ? "bg-linear-to-r from-yellow-500 to-orange-500 hover:shadow-yellow-200" : "bg-linear-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-200"}`}
                >
                  {instalasiLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {isEditingInstalasi ? "Simpan Perubahan" : "Simpan Instalasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* -------------------------------------------------------- */}
    </div>
  );
}
