import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/DasboardMaterias.css";


interface Asignacion {
  idAsignacionDocente: number;
  curso: string;
  grado: string;
  materia: string;
  anioEscolar: string;
}

const MateriasMaestroPage = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/PanelMaestro/mis-asignaciones")
      .then((res) => setAsignaciones(res.data))
      .catch((err) => console.error(err.response?.data));
  }, []);

  const nombreMaestro = user?.nombreUsuario ?? "Maestro";

  const materiasUnicas = new Set(
    asignaciones.map((a) => a.materia)
  ).size;

  return (
    <>

        {/* TOPBAR */}
        <header className="maestro-topbar">

          <div className="breadcrumb">

            <span>
              Espacio de trabajo
            </span>

            <i>/</i>

            <strong>
              Mis materias
            </strong>

          </div>

          <div className="topbar-actions">

            <button
              className="topbar-icon"
              title="Buscar"
            >
              ⌕
            </button>

            <button
              className="topbar-icon notification"
              title="Notificaciones"
            >
              ♢
              <span></span>
            </button>

            <div className="top-avatar">
              {nombreMaestro.substring(0, 2).toUpperCase()}
            </div>

          </div>

        </header>

        {/* ================= PÁGINA ================= */}
        <div className="dashboard-content">

          {/* ENCABEZADO */}
          <section className="dashboard-heading">

            <div>

              <span className="dashboard-eyebrow">
                ESPACIO DE TRABAJO · DOCENTE
              </span>

              <h1>
                Mis cursos y materias
              </h1>

              <p>
                Consulta tus asignaciones y accede a cada curso.
              </p>

            </div>

          </section>

          {/* RESUMEN */}
          <section className="summary-section">

            <div className="section-heading">

              <span className="section-eyebrow">
                RESUMEN
              </span>

              <h2>
                Tus asignaciones académicas
              </h2>

            </div>

            <div className="stats-grid">

              {/* CURSOS */}
              <article className="stat-card">

                <div className="stat-icon blue">
                  ▦
                </div>

                <div className="stat-content">

                  <span>
                    Cursos asignados
                  </span>

                  <strong>
                    {
                      new Set(
                        asignaciones.map(
                          (a) => `${a.grado}-${a.curso}`
                        )
                      ).size
                    }
                  </strong>

                  <small>
                    cursos activos
                  </small>

                </div>

              </article>

              {/* MATERIAS */}
              <article className="stat-card">

                <div className="stat-icon teal">
                  ✦
                </div>

                <div className="stat-content">

                  <span>
                    Materias
                  </span>

                  <strong>
                    {materiasUnicas}
                  </strong>

                  <small>
                    materias asignadas
                  </small>

                </div>

              </article>

              {/* ASIGNACIONES */}
              <article className="stat-card">

                <div className="stat-icon amber">
                  ◷
                </div>

                <div className="stat-content">

                  <span>
                    Asignaciones
                  </span>

                  <strong>
                    {asignaciones.length}
                  </strong>

                  <small>
                    asignaciones docentes
                  </small>

                </div>

              </article>

            </div>

          </section>

          {/* ================= MATERIAS ================= */}
          <section className="courses-section">

            <div className="courses-header">

              <div>

                <span className="section-eyebrow">
                  ASIGNACIONES
                </span>

                <h2>
                  Tus cursos
                </h2>

                <p>
                  Selecciona un curso para comenzar a trabajar.
                </p>

              </div>

            </div>

            {asignaciones.length > 0 ? (

              <div className="course-grid">

                {asignaciones.map((a) => (

                  <article
                    className="course-card"
                    key={a.idAsignacionDocente}
                  >

                    {/* PARTE SUPERIOR */}
                    <div className="course-card-top">

                      <div className="course-icon">
                        ✦
                      </div>

                      <span className="course-status">

                        <i></i>

                        Activo

                      </span>

                    </div>

                    {/* INFORMACIÓN */}
                    <div className="course-card-body">

                      <span className="course-level">
                        {a.grado}
                      </span>

                      <h3>
                        {a.materia}
                      </h3>

                      <p>
                        {a.curso}
                      </p>

                    </div>

                    {/* FOOTER */}
                    <div className="course-card-footer">

                      <span>
                        {a.anioEscolar}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            `/maestro/asignacion/${a.idAsignacionDocente}`
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
                  No tienes materias asignadas
                </h3>

                <p>
                  Las asignaciones aparecerán aquí cuando estén disponibles.
                </p>

              </div>

            )}

          </section>

        </div>

      </>
  );
};

export default MateriasMaestroPage;