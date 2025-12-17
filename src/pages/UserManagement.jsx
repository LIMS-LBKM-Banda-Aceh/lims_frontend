import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  X,
  Save,
  KeyRound,
  Loader2,
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Form
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    password: "", // Optional saat edit
    role: "input",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({ id: null, username: "", password: "", role: "input" });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    // Password dikosongkan saat edit, hanya diisi jika ingin mengubah
    setFormData({
      id: user.id,
      username: user.username,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Yakin ingin menghapus user ${username}?`)) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("User berhasil dihapus");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menghapus user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (isEditing) {
        // Mode Edit
        const payload = {
          username: formData.username,
          role: formData.role,
        };
        // Hanya kirim password jika diisi
        if (formData.password) payload.password = formData.password;

        await api.put(`/users/${formData.id}`, payload);
        toast.success("Data user diperbarui");
      } else {
        // Mode Create (Register)
        if (!formData.password) {
          toast.warn("Password wajib diisi untuk user baru");
          setSubmitLoading(false);
          return;
        }
        await api.post("/users/register", formData);
        toast.success("User baru berhasil dibuat");
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper Badge Role
  const RoleBadge = ({ role }) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      input: "bg-blue-50 text-blue-700 border-blue-200",
      lab: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
          styles[role] || styles.input
        }`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-cyan-600" /> Manajemen User
          </h2>
          <p className="text-gray-500 text-sm">
            Kelola akun dan hak akses pengguna sistem.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari username..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Total: {filteredUsers.length} Users
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role / Hak Akses</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                          {item.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {item.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={item.role} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.username)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Hapus User"
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
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">
                {isEditing ? "Edit User" : "Tambah User Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-cyan-600" /> Username
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Contoh: admin_lab"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield size={16} className="text-cyan-600" /> Role / Akses
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="input">Input (Staff Pendaftaran)</option>
                  <option value="lab">Lab (Petugas Lab)</option>
                  <option value="admin">Admin (Full Akses)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <KeyRound size={16} className="text-cyan-600" /> Password
                </label>
                <input
                  type="password"
                  // Required hanya jika mode Create
                  required={!isEditing}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    isEditing
                      ? "Kosongkan jika tidak ingin mengubah"
                      : "Minimal 6 karakter"
                  }
                />
                {isEditing && (
                  <p className="text-[10px] text-gray-400 italic ml-1">
                    *Isi hanya jika ingin mereset password user ini.
                  </p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-200 transition flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {isEditing ? "Simpan Perubahan" : "Buat User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
