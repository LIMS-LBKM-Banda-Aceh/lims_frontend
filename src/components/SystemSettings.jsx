import React, { useState, useEffect } from "react";
import { Save, Settings, FileCheck, Edit, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function SystemSettings() {
  const [signatureMode, setSignatureMode] = useState("qr");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load setting dari Database saat komponen di-mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data.success && res.data.data.signature_mode) {
          setSignatureMode(res.data.data.signature_mode);
        }
      } catch (error) {
        toast.error("Gagal memuat pengaturan sistem dari server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put("/settings", { signature_mode: signatureMode });
      toast.success("Pengaturan sistem berhasil disimpan secara global!");
    } catch (error) {
      console.error("Save error:", error); // Log ke console untuk debugging
      toast.error(
        error.response?.data?.message || "Gagal menyimpan pengaturan",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 size={32} className="animate-spin text-cyan-600" />
        <p className="text-gray-500 font-medium">Memuat Pengaturan Global...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pengaturan Sistem</h2>
          <p className="text-gray-500 text-sm font-medium">
            Konfigurasi preferensi global aplikasi LIMS.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">
            Metode Tanda Tangan Cetak
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Pilih bagaimana tanda tangan ditampilkan pada dokumen cetak (LHU &
            Invoice) untuk semua pengguna.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Option 1: QR Code */}
          <label
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              signatureMode === "qr"
                ? "border-cyan-500 bg-cyan-50/30"
                : "border-gray-200 hover:border-cyan-200 hover:bg-gray-50"
            }`}
          >
            <div className="pt-1">
              <input
                type="radio"
                name="signatureMode"
                value="qr"
                checked={signatureMode === "qr"}
                onChange={(e) => setSignatureMode(e.target.value)}
                className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-gray-700" />
                <span className="font-bold text-gray-800">
                  Gunakan QR Code (Digital)
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Dokumen akan dicetak dengan QR Code yang berisi data validasi.
              </p>
            </div>
          </label>

          {/* Option 2: Manual */}
          <label
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              signatureMode === "manual"
                ? "border-cyan-500 bg-cyan-50/30"
                : "border-gray-200 hover:border-cyan-200 hover:bg-gray-50"
            }`}
          >
            <div className="pt-1">
              <input
                type="radio"
                name="signatureMode"
                value="manual"
                checked={signatureMode === "manual"}
                onChange={(e) => setSignatureMode(e.target.value)}
                className="w-5 h-5 text-cyan-600 focus:ring-cyan-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Edit size={18} className="text-gray-700" />
                <span className="font-bold text-gray-800">
                  Kosongkan (Tanda Tangan Manual)
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Area tanda tangan dibiarkan kosong untuk tanda tangan basah.
              </p>
            </div>
          </label>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-cyan-200 transition-all"
          >
            {/* Bungkus Icon dalam span statis */}
            <span className="flex items-center justify-center">
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
            </span>

            {/* Bungkus Text dalam span statis */}
            <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
