import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUsers,
  FaLayerGroup,
  FaBook,
  FaBell,
  FaCalendarAlt,
  FaUserCog,
  FaChartBar,
} from "react-icons/fa";

import api from "../../api/axiosConfig";
import { obtenerNivelCoordinador } from "../../Utils/permisos";
import "../../Styles/Admindasboard.css";

interface DashboardData {
  estudiantes: number;
  maestros: number;
  padres: number;
  cursos: number;
  materias: number;
  publicacionesAbiertas: number;
  anioActivo: string | null;
}

const DashboardAdmin = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const nivel = obtenerNivelCoordinador(user?.rol);
  const esAdministrador = user?.rol === "Administrador";

  useEffect(() => {
    api.get("/Dashboard").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return <p className="dashboard-loading">Cargando dashboard...</p>;
  }

  return (
    <div className="dashboard-admin">

      {/* ENCABEZADO */}

      <div className="dashboard-header">

        <div>
          <span className="dashboard-label">
            PANEL DE CONTROL
          </span>

          <h1>
            {esAdministrador
              ? "Bienvenido, Administrador"
              : `Bienvenido, Coordinador ${nivel}`}
          </h1>

          <p>
            {esAdministrador
              ? "Gestiona y supervisa la información académica de todos los centros educativos."
              : `Gestiona la información académica correspondiente a ${nivel}.`}
          </p>
        </div>

        <div className="dashboard-year">
          <div className="dashboard-year-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <span>AÑO ESCOLAR ACTIVO</span>
            <strong>{data.anioActivo ?? "No definido"}</strong>
          </div>
        </div>

      </div>


      {/* RESUMEN */}

      <div className="dashboard-section-title">
        <span>RESUMEN ACADÉMICO</span>
        <h2>Estado general del sistema</h2>
      </div>


      <div className="dashboard-cards">

        <div className="dashboard-card teal">
          <div className="card-icon">
            <FaUserGraduate />
          </div>

          <span>ESTUDIANTES</span>
          <strong>{data.estudiantes}</strong>
          <p>Estudiantes registrados</p>
        </div>


        <div className="dashboard-card blue">
          <div className="card-icon">
            <FaChalkboardTeacher />
          </div>

          <span>MAESTROS</span>
          <strong>{data.maestros}</strong>
          <p>Personal docente</p>
        </div>


        <div className="dashboard-card purple">
          <div className="card-icon">
            <FaUsers />
          </div>

          <span>PADRES</span>
          <strong>{data.padres}</strong>
          <p>Padres registrados</p>
        </div>


        <div className="dashboard-card yellow">
          <div className="card-icon">
            <FaLayerGroup />
          </div>

          <span>CURSOS</span>
          <strong>{data.cursos}</strong>
          <p>Cursos activos</p>
        </div>


        <div className="dashboard-card green">
          <div className="card-icon">
            <FaBook />
          </div>

          <span>MATERIAS</span>
          <strong>{data.materias}</strong>
          <p>Materias disponibles</p>
        </div>


        <div className="dashboard-card orange">
          <div className="card-icon">
            <FaBell />
          </div>

          <span>PUBLICACIONES</span>
          <strong>{data.publicacionesAbiertas}</strong>
          <p>Publicaciones abiertas</p>
        </div>

      </div>


      {/* ACCESOS RÁPIDOS */}

      <div className="dashboard-section-title quick-title">
        <span>ACCESOS RÁPIDOS</span>
        <h2>Gestión administrativa</h2>
      </div>


      <div className="dashboard-quick">

        {esAdministrador && (
          <button
            onClick={() => navigate("/admin/coordinadores")}
          >
            <div className="quick-icon purple">
              <FaUserCog />
            </div>

            <div>
              <strong>Coordinadores</strong>
              <p>
                Gestiona los coordinadores de cada centro.
              </p>
            </div>

            <span>→</span>
          </button>
        )}


        <button
          onClick={() => navigate("/admin/maestros")}
        >
          <div className="quick-icon blue">
            <FaChalkboardTeacher />
          </div>

          <div>
            <strong>Maestros</strong>
            <p>
              Gestiona el personal docente.
            </p>
          </div>

          <span>→</span>
        </button>


        <button
          onClick={() => navigate("/admin/estudiantes")}
        >
          <div className="quick-icon teal">
            <FaUserGraduate />
          </div>

          <div>
            <strong>Estudiantes</strong>
            <p>
              Gestiona los estudiantes registrados.
            </p>
          </div>

          <span>→</span>
        </button>


        <button
          onClick={() => navigate("/admin/reportes")}
        >
          <div className="quick-icon orange">
            <FaChartBar />
          </div>

          <div>
            <strong>Reportes</strong>
            <p>
              Consulta los reportes académicos.
            </p>
          </div>

          <span>→</span>
        </button>

      </div>

    </div>
  );
};

export default DashboardAdmin;