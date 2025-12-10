import React from "react";
import { Eye } from "lucide-react";

export default function RegistrationList({ data, onViewDetail }) {
  if (data.length === 0)
    return (
      <div className="text-center p-10 text-gray-500 bg-white rounded-xl shadow-sm">
        Belum ada data pasien.
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-4">No. Reg / Sampel</th>
              <th className="px-6 py-4">Identitas Pasien</th>
              <th className="px-6 py-4">Pemeriksaan</th>
              <th className="px-6 py-4">Asal & Status</th>
              <th className="px-6 py-4">Tgl Terima</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-3">
                  <div className="font-bold text-blue-600">{item.no_reg}</div>
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1 rounded mt-1">
                    {item.no_sampel_lab}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">
                    {item.nama_pasien}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.umur} Th •{" "}
                    {item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                  </div>
                </td>
                <td className="px-6 py-3 font-medium text-gray-700">
                  {item.jenis_pemeriksaan}
                </td>
                <td className="px-6 py-3">
                  <div className="text-xs mb-1 text-gray-500">
                    {item.asal_sampel}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border
                    ${
                      item.status === "selesai"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : item.status === "terdaftar"
                        ? "bg-gray-50 text-gray-600 border-gray-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {new Date(item.tgl_terima).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => onViewDetail(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition font-medium text-xs border border-blue-100"
                  >
                    <Eye size={14} /> Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
