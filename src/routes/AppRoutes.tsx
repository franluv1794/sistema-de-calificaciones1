import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import DashboardMaestro from "../pages/maestro/DashboardMaestro";
import DashboardEstudiante from "../pages/estudiante/DashboardEstudiante";
import DashboardPadre from "../pages/padre/DashboardPadre";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../auth/AuthContext";

import NivelesPage from "../pages/admin/NivelesPage";
import GradosPage from "../pages/admin/GradosPage";
import CursosPage from "../pages/admin/CursosPage";
import MateriasPage from "../pages/admin/MateriasPage";
import GradoMateriasPage from "../pages/admin/GradoMateriasPage";
import AniosEscolaresPage from "../pages/admin/AniosEscolaresPage";
import MaestrosPage from "../pages/admin/MaestrosPage";
import EstudiantesPage from "../pages/admin/EstudiantesPage";
import AsignacionesDocentesPage from "../pages/admin/AsignacionesDocentesPage";
import PeriodosPublicacionPage from "../pages/admin/PeriodosPublicacionPage";
import PadresPage from "../pages/admin/PadresPage";
import ReportesPage from "../pages/admin/ReportesPage";
import AsignacionMaestroPage from "../pages/maestro/AsignacionMaestroPage";
import CambiarPasswordPage from "../pages/CambiarPassword";
import MateriasMaestroPage from "../pages/maestro/MateriasMaestroPage";
import CoordinadoresAdmin from "../pages/admin/CoordinadoresAdmin";
import MaestroReportesPage from "../pages/maestro/MaestroReportesPage";
import MaestroReporteDetallePage from "../pages/maestro/MaestroReporteDetallePage";

// Ruta de inicio (dashboard) según el rol del usuario autenticado.
const homePorRol = (rol?: string) => {
  switch (rol) {
    case "Administrador":
    case "CoordinadorPrimaria":
    case "CoordinadorSecundaria":
    case "CoordinadorPolitecnico":
      return "/admin/dashboard";
    case "Maestro":
      return "/maestro/dashboard";
    case "Estudiante":
      return "/estudiante/dashboard";
    case "Padre":
      return "/padre/dashboard";
    default:
      return "/";
  }
};

const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) => {
  const { user, isAuthenticated } = useAuth();

  // Sin sesión: al login.
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // Con sesión pero sin permiso para esta sección: lo enviamos a SU panel,
  // evitando el acceso escribiendo la URL manualmente.
  if (!user?.rol || !roles.includes(user.rol)) {
    return <Navigate to={homePorRol(user?.rol)} replace />;
  }

  return children;
};

const rolesAdmin = [
  "Administrador",
  "CoordinadorPrimaria",
  "CoordinadorSecundaria",
  "CoordinadorPolitecnico",
];

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to={homePorRol(user?.rol)} replace /> : <Login />
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={rolesAdmin}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardAdmin />} />
        
        <Route path="niveles" element={<NivelesPage />} />
        <Route path="grados" element={<GradosPage />} />
        <Route path="cursos" element={<CursosPage />} />
        <Route path="materias" element={<MateriasPage />} />
        <Route path="grado-materias" element={<GradoMateriasPage />} />
        <Route path="anios-escolares" element={<AniosEscolaresPage />} />
        <Route path="maestros" element={<MaestrosPage />} />
        <Route path="estudiantes" element={<EstudiantesPage />} />
        <Route path="asignaciones-docentes" element={<AsignacionesDocentesPage />} />
        <Route path="periodos-publicacion" element={<PeriodosPublicacionPage />} />
        <Route path="padres" element={<PadresPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route

/>
        <Route
  path="/admin/coordinadores"
  element={<CoordinadoresAdmin />}
/>
      </Route>

      <Route
        path="/maestro/dashboard"
        element={
          <ProtectedRoute roles={["Maestro"]}>
            <DashboardMaestro />
          </ProtectedRoute>
        }
      />

      <Route
        path="/maestro/asignacion/:id"
        element={
          <ProtectedRoute roles={["Maestro"]}>
            <AsignacionMaestroPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/maestro/materias"
        element={
          <ProtectedRoute roles={["Maestro"]}>
            <MateriasMaestroPage />
          </ProtectedRoute>
        }

        
      />
<Route
  path="/maestro/reportes"
  element={
    <ProtectedRoute roles={["Maestro"]}>
      <MaestroReportesPage />
    </ProtectedRoute>
  }
/>
 
 <Route
  path="/maestro/reportes/detalle/:idAsignacionDocente/:idCurso"
  element={<MaestroReporteDetallePage />}
/>

      <Route
        path="/estudiante/dashboard"
        element={
          <ProtectedRoute roles={["Estudiante"]}>
            <DashboardEstudiante />
          </ProtectedRoute>
        }
      />

      <Route
        path="/padre/dashboard"
        element={
          <ProtectedRoute roles={["Padre"]}>
            <DashboardPadre />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cambiar-password"
        element={
          isAuthenticated ? <CambiarPasswordPage /> : <Navigate to="/" replace />
        }
      />

      {/* Cualquier ruta desconocida: al inicio del usuario o al login */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? homePorRol(user?.rol) : "/"} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
