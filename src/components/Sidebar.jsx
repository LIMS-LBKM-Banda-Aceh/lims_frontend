import React from "react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  FlaskConical,
  PlusCircle,
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
    if (confirm("Yakin ingin keluar?")) {
      logout();
    }
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "list", label: "Data Pasien", icon: FileText },
    { id: "create", label: "Registrasi Baru", icon: PlusCircle },
  ];

  return (
    <>
      {/* Overlay untuk Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 shadow-xl shadow-blue-100/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-50">
          <img
            src="/logo.svg"
            alt="Labkesmas Logo"
            className="mx-auto h-12 w-auto mb-4 space-y-10"
          />
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2 mt-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const isActive =
              currentView === item.id ||
              (currentView === "detail" && item.id === "list");
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout (Fixed at Bottom) */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold border-2 border-white shadow-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.role || "Staff"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-100 transition shadow-sm"
          >
            <LogOut size={16} /> Keluar Aplikasi
          </button>
        </div>
      </aside>
    </>
  );
}
