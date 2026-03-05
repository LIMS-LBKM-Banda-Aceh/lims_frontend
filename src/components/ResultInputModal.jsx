import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  X,
  Save,
  TestTube2,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// --- UI/UX HELPER: Analisis Hasil vs Nilai Rujukan ---
export const analyzeResult = (nilai, rujukan) => {
  if (!nilai || !rujukan) return "normal";

  const valStr = String(nilai).trim().toLowerCase();
  const refStr = String(rujukan).trim().toLowerCase();

  // 1. Kualitatif (Teks)
  if (
    ["negatif", "positif", "normal", "reaktif", "non reaktif"].some((kw) =>
      refStr.includes(kw),
    )
  ) {
    if (refStr.includes("negatif") && !valStr.includes("negatif"))
      return "abnormal";
    if (refStr.includes("non reaktif") && !valStr.includes("non reaktif"))
      return "abnormal";
    if (refStr.includes("normal") && !valStr.includes("normal"))
      return "abnormal";
    return "normal";
  }

  // 2. Kuantitatif (Angka)
  // Tangani spasi dan koma Indo -> Titik desimal
  const valNum = parseFloat(valStr.replace(/,/g, ".").replace(/[^0-9.-]/g, ""));
  if (isNaN(valNum)) return "normal";

  // Cek Kurang Dari (<)
  if (refStr.includes("<")) {
    const refNum = parseFloat(
      refStr.replace(/[^0-9.,]/g, "").replace(/,/g, "."),
    );
    if (!isNaN(refNum) && valNum > refNum) return "high";
  }

  // Cek Lebih Dari (>)
  if (refStr.includes(">")) {
    const refNum = parseFloat(
      refStr.replace(/[^0-9.,]/g, "").replace(/,/g, "."),
    );
    if (!isNaN(refNum) && valNum < refNum) return "low";
  }

  // Cek Range (Toleransi semua jenis Dash: hyphen, en-dash, em-dash, minus matematis)
  const rangeRegex = /[-–—−~]|s\/d|sampai|to/i;
  if (rangeRegex.test(refStr)) {
    const parts = refStr
      .split(rangeRegex)
      .map((p) => parseFloat(p.replace(/[^0-9.,]/g, "").replace(/,/g, ".")))
      .filter((n) => !isNaN(n));

    if (parts.length >= 2) {
      const min = Math.min(parts[0], parts[1]);
      const max = Math.max(parts[0], parts[1]);
      if (valNum < min) return "low";
      if (valNum > max) return "high";
    }
  }

  return "normal";
};

// --- UI/UX HELPER: Deteksi Dropdown Kualitatif ---
const isQualitative = (rujukan) => {
  if (!rujukan) return false;
  const r = String(rujukan).toLowerCase();
  return ["negatif", "positif", "normal", "reaktif", "non reaktif"].some((kw) =>
    r.includes(kw),
  );
};

const getQualitativeOptions = (rujukan) => {
  const r = String(rujukan).toLowerCase();
  if (r.includes("reaktif")) return ["Non Reaktif", "Reaktif"];
  if (r.includes("normal")) return ["Normal", "Abnormal"];
  return ["Negatif", "Positif"];
};
// -----------------------------------------------------

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

  const handleInputChange = (testId, value) => {
    const strValue = typeof value === "string" ? value : String(value);
    setTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, nilai: strValue } : t)),
    );
  };

  const handleSaveAll = async () => {
    const emptyTests = tests.filter(
      (t) => !t.nilai || t.nilai.toString().trim() === "",
    );

    if (emptyTests.length > 0) {
      const missingParams = emptyTests.map((t) => t.parameter_name).join(", ");
      toast.warn(`Harap lengkapi nilai untuk: ${missingParams}`);
      return;
    }

    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menyimpan ${tests.length} hasil tes ini? \n\nPastikan data sudah benar karena akan diverifikasi.`,
    );

    if (!isConfirmed) return;

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
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                  <th className="pb-3 pl-2">Parameter</th>
                  <th className="pb-3 text-center">Metode</th>
                  <th className="pb-3">Nilai Rujukan</th>
                  <th className="pb-3 w-56 text-center">Hasil Uji</th>
                  <th className="pb-3 text-center w-24">Satuan</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map((test) => {
                  const refValue = test.nilai_rujukan || test.range_normal;
                  const isQualMode = isQualitative(refValue);
                  const status = analyzeResult(test.nilai, refValue);

                  const isAbnormal = status !== "normal" && test.nilai;
                  const inputClass = `w-full border rounded-lg px-3 py-2 outline-none transition-all ${
                    isAbnormal
                      ? "border-red-400 bg-red-50 text-red-700 font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
                      : "border-gray-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  }`;

                  return (
                    <tr
                      key={test.id}
                      className={`hover:bg-gray-50/50 transition-colors ${isAbnormal ? "bg-red-50/20" : ""}`}
                    >
                      <td className="py-3 pl-2 font-medium text-gray-700">
                        {test.parameter_name}
                      </td>
                      <td className="py-3 text-gray-500 text-xs text-center">
                        {test.metode || "-"}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {refValue || "-"}
                      </td>
                      <td className="py-3 relative">
                        {isQualMode ? (
                          <select
                            className={inputClass}
                            value={test.nilai || ""}
                            onChange={(e) =>
                              handleInputChange(test.id, e.target.value)
                            }
                            disabled={saving}
                            required
                          >
                            <option value="" disabled>
                              -- Pilih --
                            </option>
                            {getQualitativeOptions(refValue).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              className={`${inputClass} pr-8`}
                              value={test.nilai || ""}
                              onChange={(e) =>
                                handleInputChange(test.id, e.target.value)
                              }
                              placeholder="Input angka..."
                              disabled={saving}
                              required
                            />
                            {status === "high" && (
                              <ArrowUp
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600"
                              />
                            )}
                            {status === "low" && (
                              <ArrowDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600"
                              />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-gray-500 text-center text-xs">
                        {test.satuan || "-"}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-bold ${
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

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500 italic flex items-center gap-1">
            <AlertCircle size={14} className="text-red-500" />
            Sistem akan menandai hasil di luar rujukan dengan warna{" "}
            <span className="text-red-600 font-bold">merah</span>.
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
