import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../auth/AuthContext";
import "../Styles/DashboardMaestro.css";
import "../Styles/MaestroLayout.css";

import miLogo from "../Componentes/imagenes/logo-mir.png";

const MaestroLayout = () => {
  const [totalAsignaciones, setTotalAsignaciones] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    api
      .get("/PanelMaestro/mis-asignaciones")
      .then((res) => setTotalAsignaciones(res.data?.length ?? 0))
      .catch((err) => console.error(err.response?.data));
  }, []);

  // En celular, el menú se cierra al cambiar de página
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  const nombreMaestro = user?.nombreUsuario ?? "Maestro";

  const claseItem = (...rutas: string[]) =>
    rutas.some((ruta) => pathname.startsWith(ruta))
      ? "nav-item active"
      : "nav-item";

  return (
    <div className="maestro-layout">

      {/* BOTÓN DE MENÚ (solo celular) */}
      <button
        type="button"
        className="maestro-menu-toggle"
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto((abierto) => !abierto)}
      >
        {menuAbierto ? "✕" : "☰"}
      </button>

      {menuAbierto && (
        <div
          className="maestro-menu-overlay"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`maestro-sidebar${menuAbierto ? " abierto" : ""}`}>

        <div className="sidebar-brand">
          <div className="brand-logo">
            <img src={miLogo} alt="Logo" />
          </div>

          <div className="brand-name">
            <span>Calificaciones</span>
            <strong></strong>
          </div>
        </div>

        {/* PERFIL */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {nombreMaestro.substring(0, 2).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{nombreMaestro}</strong>
            <span>Docente</span>
          </div>

          <button className="profile-more">•••</button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="sidebar-nav">

          <span className="nav-section-title">
            ESPACIO DE TRABAJO
          </span>

          <button
            className={claseItem("/maestro/dashboard")}
            onClick={() => navigate("/maestro/dashboard")}
          >
            <span className="nav-icon">⌂</span>
            <span>Inicio</span>
          </button>

          <button
            className={claseItem("/maestro/materias", "/maestro/asignacion")}
            onClick={() => navigate("/maestro/materias")}
          >
            <span className="nav-icon">▣</span>
            <span>Materias</span>

            {totalAsignaciones > 0 && (
              <span className="nav-badge">
                {totalAsignaciones}
              </span>
            )}
          </button>

          <span className="nav-section-title gestion-title">
            GESTIÓN
          </span>

          <button
            className={claseItem("/maestro/reportes")}
            onClick={() => navigate("/maestro/reportes")}
          >
            <span className="nav-icon">▤</span>
            <span>Reportes</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/cambiar-password")}
          >
            <span className="nav-icon">⚙</span>
            <span>Configuración</span>
          </button>

        </nav>

        {/* AYUDA */}
        <div className="sidebar-help">
          <div className="help-circle">?</div>

          <div className="help-content">
            <strong>¿Necesitas ayuda?</strong>
            <span>Consulta la guía docente</span>
            <button>Ver guía →</button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <span>© 2026 Fundacion MIR. Todos los derechos reservados.</span>

          <button
            onClick={cerrarSesion}
            title="Cerrar sesión"
            className="logout-button"
          >
            ↪
          </button>
        </div>

      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="maestro-main">
        <Outlet />
      </main>

    </div>
  );
};

export default MaestroLayout;
