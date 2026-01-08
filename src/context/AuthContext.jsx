import { createContext, useState, useContext, useEffect, useMemo } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const AuthContext = createContext(null);
import PropTypes from "prop-types";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek apakah user sudah login saat aplikasi dibuka (refresh)
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/users/profile");
          setUser(res.data.data);
        } catch (error) {
          console.error("Gagal ambil profile", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post("/users/login", { username, password });
      const { token, user } = res.data.data;

      localStorage.setItem("token", token);
      setUser(user);
      toast.success(`Selamat datang, ${user.fullname}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.info("Berhasil logout");
  };

  const authContextValue = useMemo(
    () => ({ user, login, logout, loading }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
