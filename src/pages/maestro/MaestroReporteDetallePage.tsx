import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import "./MaestroReporteDetallePage.css";
import logoImage from "../../imagenes/Captura de pantalla 2026-06-10 122000.png"

interface Asignacion {
  idAsignacionDocente: number;
  idCurso: number;
  curso: string;
  grado: string;
  materia: string;
  anioEscolar: string;
  nivel: string;
}

const normalizar = (texto: string = "") =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const obtenerMateria = (m: any) =>
  m?.Materia ??
  m?.materia ??
  "";

const obtenerFinal = (m: any) =>
  m?.FinalArea ??
  m?.finalArea ??
  m?.PromedioFinal ??
  m?.promedioFinal ??
  m?.Total ??
  m?.total ??
  null;

const obtenerCompetenciaFinal = (competencia: any) =>
  competencia?.Final ??
  competencia?.final ??
  null;

const formatearNota = (nota: any) => {
  if (
    nota === null ||
    nota === undefined ||
    nota === ""
  ) {
    return "—";
  }

  const numero = Number(nota);

  if (Number.isNaN(numero)) {
    return nota;
  }

  return Number.isInteger(numero)
    ? numero.toString()
    : numero.toFixed(2);
};

const MaestroReporteDetallePage = () => {
  const { idCurso } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const asignacion = location.state?.asignacion as
    | Asignacion
    | undefined;

  const [reporte, setReporte] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarReporte = async () => {
      if (!idCurso || !asignacion) {
        setError("No se pudo identificar el curso.");
        setCargando(false);
        return;
      }

      try {
        let url = "";

        if (asignacion.nivel === "Primaria") {
          url = `/Reportes/primaria/anual/curso/${idCurso}`;
        } else if (asignacion.nivel === "Secundaria") {
          url = `/Reportes/secundaria/anual/curso/${idCurso}`;
        } else if (
          asignacion.nivel === "Politécnico" ||
          asignacion.nivel === "Politecnico"
        ) {
          url = `/Reportes/politecnico/anual/curso/${idCurso}`;
        } else {
          setError(
            `No se reconoce el nivel: ${asignacion.nivel}`
          );
          setCargando(false);
          return;
        }

        const res = await api.get(url);

        setReporte(res.data);
      } catch (err: any) {
        console.error("Error cargando reporte:", err);

        setError(
          err.response?.data ||
            "No se pudo cargar el reporte anual."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarReporte();
  }, [idCurso, asignacion]);

  if (cargando) {
    return (
      <div className="detalle-reportes-page">
        <div className="reporte-loading">
          <div className="loading-spinner"></div>
          <span>Cargando reporte anual...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-reportes-page">
        <button
          className="reporte-back-button"
          onClick={() => navigate("/maestro/reportes")}
        >
          ← Volver a mis reportes
        </button>

        <div className="reporte-error-box">
          <div className="error-icon">!</div>

          <h2>No se pudo cargar el reporte</h2>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  const reportesOriginales =
    reporte?.Reportes ??
    reporte?.reportes ??
    [];

  /*
   * IMPORTANTE:
   * El backend devuelve todas las materias del curso.
   * Aquí dejamos solamente la materia que el maestro tiene asignada.
   */
  const reportes = reportesOriginales
    .map((r: any) => {
      const materiasOriginales =
        r?.Materias ??
        r?.materias ??
        [];

      const materiasFiltradas =
        materiasOriginales.filter(
          (m: any) =>
            normalizar(obtenerMateria(m)) ===
            normalizar(asignacion?.materia)
        );

      return {
        ...r,
        Materias: materiasFiltradas,
      };
    })
    .filter(
      (r: any) =>
        r.Materias &&
        r.Materias.length > 0
    );

  return (
    <div className="detalle-reportes-page">

      {/* CABECERA DE LA PÁGINA */}

      <div className="reporte-topbar">

        <button
          className="reporte-back-button"
          onClick={() =>
            navigate("/maestro/reportes")
          }
        >
          ← Mis reportes
        </button>

        <div className="reporte-topbar-right">
          <span>
            REPORTE ACADÉMICO
          </span>

          <div className="year-badge">
            {asignacion?.anioEscolar}
          </div>
        </div>

      </div>

      {/* DOCUMENTO */}

      <main className="documento-academico">

        {/* ENCABEZADO */}

        <header className="documento-portada">

          <div className="documento-brand">

            <div className="brand-mark">
              MR
            </div>

            <div>
              <span>
                SISTEMA DE CALIFICACIONES
              </span>

              <strong>
                Reporte académico
              </strong>
            </div>

          </div>

          <div className="documento-titulo">

            <span>
              REPORTE ANUAL
            </span>

            <h1>
              {asignacion?.materia}
            </h1>

            <p>
              {asignacion?.grado} ·{" "}
              {asignacion?.curso}
            </p>

          </div>

        </header>

        {/* INFORMACIÓN DEL CURSO */}

        <section className="curso-info">

          <div className="curso-info-item">
            <span>CURSO</span>
            <strong>
              {asignacion?.curso}
            </strong>
          </div>

          <div className="curso-info-item">
            <span>GRADO</span>
            <strong>
              {asignacion?.grado}
            </strong>
          </div>

          <div className="curso-info-item">
            <span>MATERIA</span>
            <strong>
              {asignacion?.materia}
            </strong>
          </div>

          <div className="curso-info-item">
            <span>AÑO ESCOLAR</span>
            <strong>
              {asignacion?.anioEscolar}
            </strong>
          </div>

        </section>

        {/* TÍTULO */}

        <div className="lista-heading">

          <div>
            <span>
              RESULTADOS ACADÉMICOS
            </span>

            <h2>
              Estudiantes
            </h2>
          </div>

          <div className="student-count">
            {reportes.length}{" "}
            {reportes.length === 1
              ? "estudiante"
              : "estudiantes"}
          </div>

        </div>

        {/* ESTUDIANTES */}

        <section className="estudiantes-lista">

          {reportes.length === 0 ? (

            <div className="sin-resultados">

              <div className="sin-resultados-icon">
                —
              </div>

              <h3>
                No hay resultados disponibles
              </h3>

              <p>
                No existen calificaciones publicadas
                para esta materia.
              </p>

            </div>

          ) : (

            reportes.map(
              (r: any, index: number) => {

                const estudiante =
                  r?.Estudiante ??
                  r?.estudiante ??
                  "Estudiante";

                const matricula =
                  r?.Matricula ??
                  r?.matricula ??
                  "—";

                const materia =
                  r?.Materias?.[0];

                const final =
                  obtenerFinal(materia);

                const c1 =
                  materia?.C1 ??
                  materia?.c1;

                const c2 =
                  materia?.C2 ??
                  materia?.c2;

                const c3 =
                  materia?.C3 ??
                  materia?.c3;

                return (
                  <article
                    className="estudiante-card"
                    key={
                      r?.IdEstudiante ??
                      r?.idEstudiante ??
                      index
                    }
                  >

                    {/* CABECERA ESTUDIANTE */}

                    <div className="estudiante-card-header">

                      <div className="estudiante-identidad">

                        <div className="estudiante-avatar">
                          {estudiante
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <h3>
                            {estudiante}
                          </h3>

                          <span>
                            Matrícula:{" "}
                            {matricula}
                          </span>

                        </div>

                      </div>

                      <div className="resultado-final">

                        <span>
                          PROMEDIO FINAL
                        </span>

                        <strong>
                          {formatearNota(final)}
                        </strong>

                      </div>

                    </div>

                    {/* COMPETENCIAS */}

                    <div className="competencias-grid">

                      {/* C1 */}

                      <div className="competencia-card">

                        <div className="competencia-top">
                          <span className="competencia-number">
                            C1
                          </span>

                          <span>
                            Comunicativa
                          </span>
                        </div>

                        <div className="competencia-bottom">
                          <span>
                            Resultado final
                          </span>

                          <strong>
                            {formatearNota(
                              obtenerCompetenciaFinal(
                                c1
                              )
                            )}
                          </strong>
                        </div>

                      </div>

                      {/* C2 */}

                      <div className="competencia-card">

                        <div className="competencia-top">
                          <span className="competencia-number">
                            C2
                          </span>

                          <span>
                            Pensamiento lógico
                          </span>
                        </div>

                        <div className="competencia-bottom">
                          <span>
                            Resultado final
                          </span>

                          <strong>
                            {formatearNota(
                              obtenerCompetenciaFinal(
                                c2
                              )
                            )}
                          </strong>
                        </div>

                      </div>

                      {/* C3 */}

                      <div className="competencia-card">

                        <div className="competencia-top">
                          <span className="competencia-number">
                            C3
                          </span>

                          <span>
                            Ética y ciudadanía
                          </span>
                        </div>

                        <div className="competencia-bottom">
                          <span>
                            Resultado final
                          </span>

                          <strong>
                            {formatearNota(
                              obtenerCompetenciaFinal(
                                c3
                              )
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* TABLA DE PERÍODOS */}

                    <div className="periodos-table">

                      <div className="periodos-table-header">

                        <span>
                          PERÍODO
                        </span>

                        <span>
                          C1
                        </span>

                        <span>
                          C2
                        </span>

                        <span>
                          C3
                        </span>

                      </div>

                      <div className="periodos-row">

                        <span>
                          Primer período
                        </span>

                        <strong>
                          {formatearNota(
                            c1?.P1 ??
                            c1?.p1
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c2?.P1 ??
                            c2?.p1
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c3?.P1 ??
                            c3?.p1
                          )}
                        </strong>

                      </div>

                      <div className="periodos-row">

                        <span>
                          Segundo período
                        </span>

                        <strong>
                          {formatearNota(
                            c1?.P2 ??
                            c1?.p2
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c2?.P2 ??
                            c2?.p2
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c3?.P2 ??
                            c3?.p2
                          )}
                        </strong>

                      </div>

                      <div className="periodos-row">

                        <span>
                          Tercer período
                        </span>

                        <strong>
                          {formatearNota(
                            c1?.P3 ??
                            c1?.p3
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c2?.P3 ??
                            c2?.p3
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c3?.P3 ??
                            c3?.p3
                          )}
                        </strong>

                      </div>

                      <div className="periodos-row">

                        <span>
                          Cuarto período
                        </span>

                        <strong>
                          {formatearNota(
                            c1?.P4 ??
                            c1?.p4
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c2?.P4 ??
                            c2?.p4
                          )}
                        </strong>

                        <strong>
                          {formatearNota(
                            c3?.P4 ??
                            c3?.p4
                          )}
                        </strong>

                      </div>

                    </div>

                  </article>
                );
              }
            )

          )}

        </section>

        {/* PIE */}

        <footer className="documento-footer">

          <span>
            Reporte generado desde el Sistema de
            Calificaciones
          </span>

          <span>
            {asignacion?.anioEscolar}
          </span>

        </footer>

      </main>
<div className="proyecto-banner">

  

  <div className="proyecto-banner-text">

   

    <span>
      Desarrollado, editado y administrado por
      <b> Francis Luz Solano</b>
      {" "}para Fundación MIR
    </span>

    <small>
      © 2026 · Todos los derechos reservados
    </small>

  </div>

</div>
    </div>
  );
};

export default MaestroReporteDetallePage;