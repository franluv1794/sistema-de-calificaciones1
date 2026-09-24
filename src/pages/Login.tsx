import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../Styles/Login.css";
import logoMireducacion from "../imagenes/Gemini_Generated_Image_vm4u0uvm4u0uvm4u.png";
import Mirfoto from "../imagenes/mir imagenes.png";

const Login = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(nombreUsuario, password);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      console.log("USUARIO LOGIN:", user);
      console.log("ROL:", user.rol);
      console.log("ROLE:", user.role);
      console.log("NOMBRE:", user.nombre);

      const rol = user.rol ?? user.role ?? user.nombre;

      if (
        rol === "Administrador" ||
        rol === "CoordinadorPrimaria" ||
        rol === "CoordinadorSecundaria" ||
        rol === "CoordinadorPolitecnico"
      ) {
        navigate("/admin/dashboard");
      } else if (rol === "Maestro") {
        navigate("/maestro/dashboard");
      } else if (rol === "Estudiante") {
        navigate("/estudiante/dashboard");
      } else if (rol === "Padre") {
        navigate("/padre/dashboard");
      } else {
        console.log("ROL NO RECONOCIDO:", rol);
        navigate("/");
      }
    } catch {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-panel">
          <div className="login-brand">
            <img
              src={logoMireducacion}
              alt="MIR Calificaciones"
              className="login-logo"
            />

            <span className="brand-title">MIR</span>
            <span className="brand-subtitle">CALIFICACIONES</span>
          </div>

          <div className="login-content">
            <div className="user-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20C5.8 16.7 8.2 15 12 15C15.8 15 18.2 16.7 19 20" />
              </svg>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="8" r="3" />
                    <path d="M5 20C5.7 16.8 8 15 12 15C16 15 18.3 16.8 19 20" />
                  </svg>
                </span>

                <input
                  type="text"
                  placeholder="USUARIO"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                />
              </div>

              <div className="input-group">
                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10" />
                  </svg>
                </span>

                <input
                  type="password"
                  placeholder="CONTRASEÑA"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="login-button">
                INICIAR SESIÓN
              </button>

              <div className="login-options">
                <label>
                  <input type="checkbox" />
                  <span>Recordarme</span>
                </label>

                <a href="#lost">¿Olvidaste tu contraseña?</a>
              </div>
            </form>
          </div>

          <div className="login-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="welcome-panel">
          <img src={Mirfoto} alt="MIR" className="welcome-background" />
          <div className="welcome-overlay"></div>

          <div className="welcome-content">
            <div className="welcome-top">
              <span>MIR CALIFICACIONES</span>

              <div className="welcome-links">
                <span>INICIO</span>
                <span>SOPORTE</span>
              </div>
            </div>

            <div className="welcome-center">
              <h1>Bienvenido.</h1>

              <p>
                Gestiona tus calificaciones, actividades y resultados académicos
                desde un solo lugar.
              </p>

              <span className="welcome-small">
                Una plataforma diseñada para facilitar la gestión educativa.
              </span>
            </div>

            <div className="welcome-bottom">
              <span>PLATAFORMA EDUCATIVA</span>
              <span>2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="proyecto-banner">
        <div className="proyecto-banner-text">
          <span>
            Desarrollado, editado y administrado por
            <b> Francis Luz Solano</b>
            {" "}para Fundación MIR
          </span>

          <small>© 2026 · Todos los derechos reservados</small>
        </div>
      </div>
    </div>
  );
};

export default Login;