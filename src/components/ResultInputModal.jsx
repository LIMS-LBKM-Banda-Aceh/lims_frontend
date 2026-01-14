import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { X, Save, TestTube2, Loader2 } from "lucide-react";

export default function ResultInputModal({
  registrationId,
  noSampel,
  onClose,
}) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get(`/registrations/${registrationId}/tests`);
        if (res.data.success) {
          setTests(res.data.data);
        }
      } catch (e) {
        console.error("Error fetching tests:", e);
        if (e.response?.status === 403) {
          toast.error("Akses ditolak. Pastikan Anda memiliki role lab.");
        } else {
          toast.error("Gagal memuat data tes");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [registrationId]);

  // Handler untuk mengubah state lokal saja
  const handleInputChange = (testId, value) => {
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, nilai: value } : t))
    );
  };

  // Logic UPDATED: Validasi Strict & Konfirmasi
  const handleSaveAll = async () => {
    // 1. Validasi: Filter item yang nilainya masih kosong/null/undefined
    const emptyTests = tests.filter(
      (t) => !t.nilai || t.nilai.toString().trim() === ""
    );

    // Jika ada list yang kosong, tolak simpan
    if (emptyTests.length > 0) {
      // Kita bisa sebutkan parameter mana yang belum diisi agar user aware
      const missingParams = emptyTests.map((t) => t.parameter_name).join(", ");
      toast.warn(`Harap lengkapi nilai untuk: ${missingParams}`);
      return; // STOP execution here
    }

    // 2. Konfirmasi: Tanya user sebelum menembak API
    // Menggunakan window.confirm (native) agar tidak perlu library tambahan
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menyimpan ${tests.length} hasil tes ini? \n\nPastikan data sudah benar karena akan diverifikasi.`
    );

    if (!isConfirmed) {
      return; // STOP execution jika user klik Cancel
    }

    // --- Mulai Proses Simpan (Logic Asli tetap dipertahankan) ---
    try {
      setSaving(true);

      const savePromises = tests.map((test) => {
        return api.put(`/tests/${test.id}/result`, { nilai: test.nilai || "" });
      });

      await Promise.all(savePromises);

      setTests((prev) => prev.map((t) => ({ ...t, status: "completed" })));

      toast.success("Semua hasil berhasil disimpan & disinkronisasi!");

      onClose();
    } catch (e) {
      console.error("Error batch saving:", e);
      toast.error("Gagal menyimpan beberapa data. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-cyan-50">
          <h3 className="font-bold text-lg text-cyan-800 flex items-center gap-2">
            <TestTube2 size={20} /> Input Hasil Lab: {noSampel}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-600 mb-4" size={32} />
              <p className="text-gray-500">Memuat data tes...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data tes ditemukan
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-2 pl-2">Parameter</th>
                  <th className="pb-2">Metode</th>
                  <th className="pb-2">Nilai Rujukan</th>
                  <th className="pb-2 w-40">Hasil</th>
                  <th className="pb-2 w-16">Satuan</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map((test) => {
                  // Visual helper: cek apakah field ini kosong saat user mencoba save (opsional, tapi bagus untuk UX)
                  const isEmpty =
                    !test.nilai || test.nilai.toString().trim() === "";

                  return (
                    <tr
                      key={test.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 pl-2 font-medium text-gray-700">
                        {test.parameter_name}
                      </td>
                      <td className="py-3 text-gray-500 text-xs text-center">
                        {test.metode || "-"}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {test.nilai_rujukan || test.range_normal || "-"}
                      </td>
                      <td className="py-3">
                        <input
                          type="text"
                          // Tambahkan visual error (border merah) jika kosong (opsional UX improvement)
                          className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                            // Logic styling: bisa dikembangkan nanti,
                            // saat ini kita pertahankan style default, fokus ke logic save
                            "border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          }`}
                          value={test.nilai || ""}
                          onChange={(e) =>
                            handleInputChange(test.id, e.target.value)
                          }
                          placeholder="Input hasil..."
                          disabled={saving}
                          // Tambahkan atribut required secara HTML5 juga sebagai double protection (visual only)
                          required
                        />
                      </td>
                      <td className="py-3 text-gray-500 text-center">
                        {test.satuan}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            test.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {test.status === "completed" ? "Selesai" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500 italic">
            *Semua kolom hasil wajib diisi.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving || loading || tests.length === 0}
              className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} /> Simpan Semua
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
