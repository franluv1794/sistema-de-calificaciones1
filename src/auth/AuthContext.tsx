import { createContext, useContext, useState, type ReactNode } from "react";
import api from "../api/axiosConfig";

interface UserData {
  nombreUsuario: string;
  rol: string;
  debeCambiarPassword: boolean;
}

interface AuthContextType {
  user: UserData | null;
  login: (nombreUsuario: string, password: string) => Promise<void>;
  logout: () => void;
  marcarPasswordCambiada: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState<UserData | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  const login = async (nombreUsuario: string, password: string) => {
    const response = await api.post("/Auth/login", {
      nombreUsuario,
      password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        nombreUsuario: response.data.nombreUsuario,
        rol: response.data.rol,
        debeCambiarPassword: response.data.debeCambiarPassword,
      })
    );

    setUser({
      nombreUsuario: response.data.nombreUsuario,
      rol: response.data.rol,
      debeCambiarPassword: response.data.debeCambiarPassword,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Tras cambiar la contraseña temporal, el usuario ya puede usar el sistema
  const marcarPasswordCambiada = () => {
    setUser((actual) => {
      if (!actual) return actual;

      const actualizado = { ...actual, debeCambiarPassword: false };
      localStorage.setItem("user", JSON.stringify(actualizado));
      return actualizado;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        marcarPasswordCambiada,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);