// src/components/Sidebar.jsx

import React from "react";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  UserCog,
  Database,
  FlaskConical,
  FileBarChart,
  Syringe,
  FileCheck, // Icon untuk Validasi
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  currentView,
  setView,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar?")) logout();
  };

  let menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  ];

  // MENU BERDASARKAN ROLE
  if (user?.role === "input" || user?.role === "admin") {
    menuItems.push({
      id: "create",
      label: "Registrasi Baru",
      icon: PlusCircle,
    });
    menuItems.push({
      id: "list",
      label: "Data Pasien",
      icon: FileText,
    });
  }

  if (user?.role === "sampler" || user?.role === "admin") {
    menuItems.push({ id: "sampler", label: "Ambil Sampel", icon: Syringe });
  }

  if (user?.role === "lab" || user?.role === "admin") {
    menuItems.push({
      id: "lab-queue",
      label: "Antrian Lab",
      icon: FlaskConical,
    });
  }

  // TAMBAHKAN MENU VALIDASI HASIL (setelah Antrian Lab, sebelum Laporan & Data)
  if (user?.role === "validator" || user?.role === "admin") {
    menuItems.push({
      id: "validation",
      label: "Validasi Hasil",
      icon: FileCheck,
    });
  }

  if (
    user?.role === "manajemen" ||
    user?.role === "admin" 
  ) {
    menuItems.push({
      id: "management",
      label: "Laporan & Data",
      icon: FileBarChart,
    });
  }

  if (user?.role === "admin" || user?.role === "input") {
    menuItems.push({
      id: "master",
      label: "Master Data",
      icon: Database,
      isAdmin: true,
    }, {
      id: "users",
      label: "User Management",
      icon: UserCog,
      isAdmin: true,
    });
  }

  if (user?.role === "kasir") {
    menuItems.push({
      id: "list",
      label: "Data Pasien",
      icon: FileText,
    });
  }

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 shadow-xl shadow-blue-100/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-50 flex-none">
          <img
            src="/logo.svg"
            alt="Labkesmas Logo"
            className="mx-auto h-12 w-auto"
          />
        </div>

        {/* Menu Items Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-2 custom-scrollbar">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group shrink-0 ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                } ${
                  item.isAdmin
                    ? "border border-dashed border-cyan-100 mt-4 bg-cyan-50/30"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? "text-cyan-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }
                  />
                  {item.label}
                </div>
                {isActive && (
                  <ChevronRight size={16} className="text-cyan-500" />
                )}
                {item.isAdmin && !isActive && (
                  <ShieldCheck size={14} className="text-cyan-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer dengan User Info */}
        <div className="w-full p-4 border-t border-gray-50 bg-white flex-none">
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-blue-100 group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold border-2 border-white shadow-sm ${
                  user?.role === "admin"
                    ? "bg-linear-to-br from-purple-100 to-purple-200 text-primary"
                    : user?.role === "validator"
                      ? "bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-700"
                      : "bg-linear-to-br from-cyan-100 to-blue-200 text-cyan-700"
                }`}
              >
                {user?.fullname?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate leading-tight group-hover:text-primary transition-colors">
                  {user?.fullname}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide truncate">
                    {user?.role || "Staff"}
                  </span>
                  {user?.role === "admin" && (
                    <ShieldCheck size={10} className="text-primary" />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-red-100"
              title="Keluar Aplikasi"
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            &copy; 2025 LIMS BLKM Banda Aceh
          </p>
        </div>
      </aside>
    </>
  );
}
