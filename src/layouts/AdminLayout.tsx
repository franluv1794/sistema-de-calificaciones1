import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import {
  LayoutDashboard,
  Building2,
  Layers,
  School,
  GraduationCap,
  BookOpen,
  BookCopy,
  CalendarDays,
  Users,
  UserCheck,
  UsersRound,
  ClipboardList,
  CalendarClock,
  FileBarChart,
  LogOut,
  Menu,
  Key,
  type LucideIcon,
} from "lucide-react";

import logoMireducacion from "../imagenes/Gemini_Generated_Image_vm4u0uvm4u0uvm4u.png";

import { useEffect, useState } from "react";

import "../Styles/AdminLayout.css";
import "../Styles/AppShell.css";

const ADMIN = "Administrador";

const COORDS = [
  "CoordinadorPrimaria",
  "CoordinadorSecundaria",
  "CoordinadorPolitecnico",
];

const TODOS = [ADMIN, ...COORDS];

interface MenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const MENU: MenuSection[] = [
  {
    section: "Principal",
    items: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: TODOS,
      },
    ],
  },

  {
    section: "Académico",
    items: [
     
     
      {
        to: "/admin/grados",
        label: "Grados",
        icon: School,
        roles: [ADMIN],
      },
      {
        to: "/admin/cursos",
        label: "Cursos",
        icon: GraduationCap,
        roles: TODOS,
      },
      {
        to: "/admin/materias",
        label: "Materias",
        icon: BookOpen,
        roles: TODOS,
      },
      {
        to: "/admin/grado-materias",
        label: "Grado y materias",
        icon: BookCopy,
        roles: [ADMIN],
      },
      {
        to: "/admin/anios-escolares",
        label: "Años escolares",
        icon: CalendarDays,
        roles: [ADMIN],
      },
    ],
  },

  {
    section: "Personas",
    items: [
      {
        to: "/admin/estudiantes",
        label: "Estudiantes",
        icon: Users,
        roles: TODOS,
      },
      {
        to: "/admin/maestros",
        label: "Maestros",
        icon: UserCheck,
        roles: TODOS,
      },
      {
        to: "/admin/padres",
        label: "Padres",
        icon: UsersRound,
        roles: [ADMIN],
      },
    ],
  },

  {
    section: "Gestión",
    items: [
      {
        to: "/admin/asignaciones-docentes",
        label: "Asignaciones docentes",
        icon: ClipboardList,
        roles: TODOS,
      },
      {
        to: "/admin/periodos-publicacion",
        label: "Períodos de publicación",
        icon: CalendarClock,
        roles: [ADMIN],
      },
    ],
  },

  {
    section: "Reportes",
    items: [
      {
        to: "/admin/reportes",
        label: "Reportes",
        icon: FileBarChart,
        roles: TODOS,
      },
    ],
  },
];

const etiquetaRol = (rol?: string) => {
  switch (rol) {
    case "Administrador":
      return "Administrador General";

    case "CoordinadorPrimaria":
      return "Coordinador Primaria";

    case "CoordinadorSecundaria":
      return "Coordinador Secundaria";

    case "CoordinadorPolitecnico":
      return "Coordinador Politécnico";

    default:
      return rol ?? "";
  }
};

const tituloPanel = (rol?: string) => {
  switch (rol) {
    case "Administrador":
      return "Panel Administrador General";

    case "CoordinadorPrimaria":
      return "Panel Coordinador Primaria";

    case "CoordinadorSecundaria":
      return "Panel Coordinador Secundaria";

    case "CoordinadorPolitecnico":
      return "Panel Coordinador Politécnico";

    default:
      return "Panel";
  }
};

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    if (window.innerWidth <= 900) {
      setIsMobileOpen((v) => !v);
    } else {
      setIsCollapsed((v) => !v);
    }
  };

  const rol = user?.rol;

  const inicial = (
    user?.nombreUsuario ?? "?"
  )
    .charAt(0)
    .toUpperCase();

  const secciones = MENU
    .map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (item) =>
          !rol ||
          item.roles.includes(rol)
      ),
    }))
    .filter(
      (sec) =>
        sec.items.length > 0
    );

  return (
    <div
      className={`
        admin-layout
        ${isCollapsed ? "collapsed" : ""}
        ${isMobileOpen ? "mobile-open" : ""}
      `}
    >

      {/* =====================================================
          BACKDROP MÓVIL
      ===================================================== */}

      <div
        className="shell-backdrop"
        onClick={() =>
          setIsMobileOpen(false)
        }
      />


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-header">

          <div className="logo-area">

            <img
              src={logoMireducacion}
              alt="MIR Calificaciones"
              className="logo-img"
            />

            {!isCollapsed && (
              <>
                <h2>
                  MIR Calificaciones
                </h2>

                <p className="sidebar-role">
                  {etiquetaRol(rol)}
                </p>
              </>
            )}

          </div>

        </div>


        {/* MENÚ */}

        <nav className="sidebar-menu">

          {secciones.map((sec) => (

            <div
              key={sec.section}
              className="sidebar-section"
            >

              {!isCollapsed && (
                <p className="shell-section-label">
                  {sec.section}
                </p>
              )}

              {sec.items.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    onClick={() =>
                      setIsMobileOpen(false)
                    }
                  >

                    <Icon size={20} />

                    {!isCollapsed && (
                      <span>
                        {item.label}
                      </span>
                    )}

                  </NavLink>
                );
              })}

            </div>
          ))}

        </nav>


        {/* USUARIO */}

        <div className="shell-sidebar-footer">

          <div className="shell-user-card">

            <div
              className="shell-user-avatar"
              aria-hidden="true"
            >
              {inicial}
            </div>

            {!isCollapsed && (
              <div className="shell-user-meta">

                <span className="name">
                  {user?.nombreUsuario}
                </span>

                <span className="role">
                  {etiquetaRol(rol)}
                </span>

              </div>
            )}

          </div>

        </div>

      </aside>


      {/* =====================================================
          CONTENIDO PRINCIPAL
      ===================================================== */}

      <main className="main-content">


        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="topbar">

          <div className="topbar-left">

            <button
              className="toggle-btn"
              onClick={toggleMenu}
              aria-label="Mostrar u ocultar menú"
            >
              <Menu size={24} />
            </button>

            <div className="topbar-title">

              <h3>
                {tituloPanel(rol)}
              </h3>

              <span>
                Sistema Académico
              </span>

            </div>

          </div>


          <div className="topbar-right">

            <div className="user-profile">

              <div className="user-info">

                <span className="user-name">
                  {user?.nombreUsuario}
                </span>

                <span className="user-role">
                  {etiquetaRol(rol)}
                </span>

              </div>


              <div className="topbar-avatar">
                {inicial}
              </div>


              <div className="topbar-actions">

                <button
                  onClick={() =>
                    navigate("/cambiar-password")
                  }
                  title="Cambiar contraseña"
                  aria-label="Cambiar contraseña"
                  className="action-icon-btn"
                >
                  <Key size={18} />
                </button>

                <button
                  onClick={cerrarSesion}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="action-icon-btn logout"
                >
                  <LogOut size={18} />
                </button>

              </div>

            </div>

          </div>

        </header>



        <section className="content">

          <div className="content-inner">

            <Outlet />

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminLayout;