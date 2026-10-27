import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/DashboardMaestro.css";


interface Asignacion {
  idAsignacionDocente: number;
  curso: string;
  grado: string;
  materia: string;
  anioEscolar: string;
  nivel: string;
}

const DashboardMaestro = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/PanelMaestro/mis-asignaciones")
      .then((res) => setAsignaciones(res.data))
      .catch((err) => {
        console.error("ERROR ASIGNACIONES:", err.response?.status);
        console.error("DATA:", err.response?.data);
      });
  }, []);

  const anioAcademico =
    asignaciones.length > 0
      ? asignaciones[0].anioEscolar
      : "No asignado";

  const materiasUnicas = new Set(
    asignaciones.map((a) => a.materia)
  ).size;

  const cursosUnicos = new Set(
    asignaciones.map((a) => `${a.grado}-${a.curso}`)
  ).size;

  const nombreMaestro = user?.nombreUsuario ?? "Maestro";

  return (
    <>

        {/* TOPBAR */}
        <header className="maestro-topbar">

          <div className="breadcrumb">
            <span>Espacio de trabajo</span>
            <i>/</i>
            <strong>Inicio</strong>
          </div>

          <div className="topbar-actions">

            <button className="topbar-icon" title="Buscar">
              ⌕
            </button>

            <button className="topbar-icon notification" title="Notificaciones">
              ♢
              <span></span>
            </button>

            <div className="top-avatar">
              {nombreMaestro.substring(0, 2).toUpperCase()}
            </div>

          </div>

        </header>

        {/* CONTENIDO */}
        <div className="dashboard-content">

          {/* ENCABEZADO */}
          <section className="dashboard-heading">

            <div>
              <span className="dashboard-eyebrow">
                PANEL DEL DOCENTE
              </span>

              <h1>
                Bienvenido, {nombreMaestro}
              </h1>

              <p>
                Aquí puedes consultar tus cursos y gestionar tus actividades académicas.
              </p>
            </div>

            <button
              className="dashboard-primary-button"
              onClick={() => navigate("/maestro/materias")}
            >
              Ver mis materias
              <span>→</span>
            </button>

          </section>

          {/* RESUMEN */}
          <section className="summary-section">

            <div className="section-heading">
              <div>
                <span className="section-eyebrow">
                  RESUMEN ACADÉMICO
                </span>

                <h2>
                  Tu actividad docente
                </h2>
              </div>
            </div>

            <div className="stats-grid">

              {/* AÑO */}
              <article className="stat-card">

                <div className="stat-icon teal">
                  ◷
                </div>

                <div className="stat-content">
                  <span>Año académico</span>
                  <strong>{anioAcademico}</strong>
                  <small>Periodo actual</small>
                </div>

              </article>

              {/* CURSOS */}
              <article className="stat-card">

                <div className="stat-icon blue">
                  ▦
                </div>

                <div className="stat-content">
                  <span>Cursos asignados</span>
                  <strong>{cursosUnicos}</strong>
                  <small>
                    {cursosUnicos === 1 ? "curso" : "cursos"} activos
                  </small>
                </div>

              </article>

              {/* MATERIAS */}
              <article className="stat-card">

                <div className="stat-icon amber">
                  ✦
                </div>

                <div className="stat-content">
                  <span>Materias</span>
                  <strong>{materiasUnicas}</strong>
                  <small>
                    {materiasUnicas === 1 ? "materia" : "materias"} asignadas
                  </small>
                </div>

              </article>

            </div>

          </section>

          {/* CURSOS */}
          <section className="courses-section">

            <div className="courses-header">

              <div>
                <span className="section-eyebrow">
                  MIS ASIGNACIONES
                </span>

                <h2>
                  Cursos y materias
                </h2>

                <p>
                  Accede rápidamente a las materias que tienes asignadas.
                </p>
              </div>

              <button
                className="view-all-button"
                onClick={() => navigate("/maestro/materias")}
              >
                Ver todas →
              </button>

            </div>

            {asignaciones.length > 0 ? (

              <div className="course-grid">

                {asignaciones.slice(0, 6).map((asignacion) => (

                  <article
                    className="course-card"
                    key={asignacion.idAsignacionDocente}
                  >

                    <div className="course-card-top">

                      <div className="course-icon">
                        ✦
                      </div>

                      <span className="course-status">
                        <i></i>
                        Activo
                      </span>

                    </div>

                    <div className="course-card-body">

                      <span className="course-level">
                        {asignacion.nivel}
                      </span>

                      <h3>
                        {asignacion.materia}
                      </h3>

                      <p>
                        {asignacion.grado} · {asignacion.curso}
                      </p>

                    </div>

                    <div className="course-card-footer">

                      <span>
                        {asignacion.anioEscolar}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            `/maestro/asignacion/${asignacion.idAsignacionDocente}`
                          )
                        }
                      >
                        Entrar →
                      </button>

                    </div>

                  </article>

                ))}

              </div>

            ) : (

              <div className="empty-courses">
                <div className="empty-icon">
                  ◌
                </div>

                <h3>
                  No tienes asignaciones todavía
                </h3>

                <p>
                  Cuando tengas cursos asignados aparecerán aquí.
                </p>
              </div>

            )}

          </section>

        </div>

      </>
  );
};

export default DashboardMaestro;