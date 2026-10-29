import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../auth/AuthContext";
import { mensajeError } from "../Componentes/Notificaciones/Notificaciones";

const LONGITUD_MINIMA = 8;

const CambiarPasswordPage = () => {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const { user, marcarPasswordCambiada, logout } = useAuth();
  const navigate = useNavigate();

  const esTemporal = !!user?.debeCambiarPassword;

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (passwordNueva.length < LONGITUD_MINIMA) {
      setError(`La nueva contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`);
      return;
    }

    if (passwordNueva !== confirmarPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (passwordNueva === passwordActual) {
      setError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setGuardando(true);

    try {
      await api.post("/Auth/cambiar-mi-password", {
        passwordActual,
        passwordNueva,
        confirmarPassword,
      });

      setMensaje("Contraseña cambiada correctamente.");
      marcarPasswordCambiada();

      // La ruta "/" lleva a cada usuario a su panel según su rol
      setTimeout(() => navigate("/", { replace: true }), 1000);
    } catch (err: any) {
      setError(mensajeError(err, "Error al cambiar contraseña."));
    } finally {
      setGuardando(false);
    }
  };

  const salir = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div style={{ maxWidth: 420, margin: "100px auto" }}>
      <h2>Cambiar contraseña</h2>

      {esTemporal && (
        <p>
          Estás usando una contraseña temporal. Para continuar, crea una
          contraseña nueva.
        </p>
      )}

      <form onSubmit={cambiarPassword} className="form-card" style={{ flexDirection: "column" }}>
        <input
          type="password"
          placeholder={esTemporal ? "Contraseña temporal" : "Contraseña actual"}
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          autoComplete="current-password"
          required
        />

        <input
          type="password"
          placeholder={`Nueva contraseña (mínimo ${LONGITUD_MINIMA} caracteres)`}
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          minLength={LONGITUD_MINIMA}
          autoComplete="new-password"
          required
        />

        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
          minLength={LONGITUD_MINIMA}
          autoComplete="new-password"
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

        <button type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Cambiar contraseña"}
        </button>

        {esTemporal && (
          <button type="button" onClick={salir}>
            Cerrar sesión
          </button>
        )}
      </form>
    </div>
  );
};

export default CambiarPasswordPage;
