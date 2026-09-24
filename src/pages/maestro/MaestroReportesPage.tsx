import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import "./MaestroReportesPage.css";

interface Asignacion {
  idAsignacionDocente: number;
  idCurso: number;
  curso: string;
  grado: string;
  materia: string;
  anioEscolar: string;
  nivel: string;
}

const MaestroReportesPage = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        const res = await api.get("/PanelMaestro/mis-asignaciones");

        console.log("ASIGNACIONES DEL MAESTRO:", res.data);

        setAsignaciones(res.data);
      } catch (error: any) {
        console.error(
          "ERROR CARGANDO ASIGNACIONES:",
          error.response?.status,
          error.response?.data
        );
      } finally {
        setCargando(false);
      }
    };

    cargarAsignaciones();
  }, []);

  const abrirReporte = (asignacion: Asignacion) => {
    if (!asignacion.idCurso) {
      alert("No se pudo identificar el curso.");
      console.error("Asignación sin idCurso:", asignacion);
      return;
    }

    navigate(
      `/maestro/reportes/detalle/${asignacion.idAsignacionDocente}/${asignacion.idCurso}`,
      {
        state: { asignacion },
      }
    );
  };

  return (
    <div className="maestro-reportes-page">

      {/* BREADCRUMB */}

      <div className="reportes-breadcrumb">
        <span>Espacio de trabajo</span>
        <b>/</b>
        <strong>Reportes</strong>
      </div>

      {/* ENCABEZADO */}

      <div className="reportes-header">
        <span className="reportes-eyebrow">
          REPORTES ACADÉMICOS
        </span>

        <h1>Mis reportes</h1>

        <p>
          Consulta los reportes de los cursos y materias que tienes
          asignados.
        </p>
      </div>

      {/* CONTENEDOR */}

      <section className="reportes-section">

        <div className="reportes-section-header">

          <div>
            <span>MIS ASIGNACIONES</span>
            <h2>Cursos y materias</h2>
          </div>

          <div className="reportes-count">
            {asignaciones.length} asignaciones
          </div>

        </div>

        {cargando ? (

          <div className="reportes-loading">
            Cargando tus asignaciones...
          </div>

        ) : asignaciones.length === 0 ? (

          <div className="reportes-empty">

            <div className="empty-icon">
              ▣
            </div>

            <h3>No tienes asignaciones</h3>

            <p>
              Actualmente no tienes cursos o materias asignados.
            </p>

          </div>

        ) : (

          <div className="reportes-grid">

            {asignaciones.map((a) => (

              <div
                className="reporte-curso-card"
                key={a.idAsignacionDocente}
              >

                <div className="reporte-card-top">

                  <div className="reporte-icon">
                    ✦
                  </div>

                  <span className="reporte-activo">
                    <i></i>
                    Activo
                  </span>

                </div>

                <div className="reporte-card-content">

                  <span className="reporte-nivel">
                    {a.nivel || "ACADÉMICO"}
                  </span>

                  <h3>
                    {a.materia}
                  </h3>

                  <p>
                    {a.grado} · {a.curso}
                  </p>

                </div>

                <div className="reporte-card-footer">

                  <span>
                    {a.anioEscolar}
                  </span>

                  <button
                    onClick={() => abrirReporte(a)}
                  >
                    Ver reporte
                    <span>→</span>
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
};

export default MaestroReportesPage;