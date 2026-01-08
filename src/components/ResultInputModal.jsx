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

  const handleUpdate = async (testId, value) => {
    try {
      setSaving(true);
      await api.put(`/tests/${testId}/result`, { nilai: value });

      // Update local state
      setTests((prev) =>
        prev.map((t) =>
          t.id === testId ? { ...t, nilai: value, status: "completed" } : t
        )
      );

      toast.success("Hasil berhasil disimpan");
    } catch (e) {
      console.error("Error updating test:", e);
      if (e.response?.status === 403) {
        toast.error("Tidak memiliki izin untuk mengupdate hasil");
      } else {
        toast.error("Gagal menyimpan hasil");
      }
    } finally {
      setSaving(false);
    }
  };

  // ResultInputModal.jsx - Perbaiki handleSaveAll
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const allFilled = tests.every((t) => t.nilai && t.nilai.trim() !== "");

      if (!allFilled) {
        toast.warning("Harap isi semua hasil");
        return;
      }

      // Pastikan Backend memproses sinkronisasi status ke 'selesai_uji'
      toast.success("Hasil laboratorium lengkap!");
      onClose(); // Ini akan memicu refresh di halaman LabQueue jika dipasang dengan benar
    } catch (e) {
      toast.error("Gagal sinkronisasi data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-cyan-50">
          <h3 className="font-bold text-lg text-cyan-800 flex items-center gap-2">
            <TestTube2 size={20} /> Input Hasil Lab: {noSampel}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

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
                  <th className="pb-2">Parameter</th>
                  <th className="pb-2">Metode</th>
                  <th className="pb-2">Nilai Rujukan</th>
                  <th className="pb-2 w-32">Hasil</th>
                  <th className="pb-2 w-16">Satuan</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td className="py-3 font-medium">{test.parameter_name}</td>
                    <td className="py-3 text-gray-500 text-xs">
                      {test.metode || "-"}
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {test.nilai_rujukan || test.range_normal || "-"}
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-cyan-500 outline-none"
                        value={test.nilai || ""}
                        onChange={(e) => {
                          const newTests = [...tests];
                          const index = newTests.findIndex(
                            (t) => t.id === test.id
                          );
                          newTests[index].nilai = e.target.value;
                          setTests(newTests);
                        }}
                        onBlur={(e) => handleUpdate(test.id, e.target.value)}
                        placeholder="Input..."
                        disabled={saving}
                      />
                    </td>
                    <td className="py-3 text-gray-500">{test.satuan}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          test.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {test.status === "completed" ? "Selesai" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {tests.filter((t) => t.nilai && t.nilai.trim() !== "").length} dari{" "}
            {tests.length} hasil telah diisi
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="bg-cyan-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-cyan-700 flex items-center gap-2 disabled:opacity-50"
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
