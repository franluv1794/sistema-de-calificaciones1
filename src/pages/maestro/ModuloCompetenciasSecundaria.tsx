import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "../../Styles/ModuloCompetenciasSecundaria.css";

interface Props {
  idAsignacionDocente: number;
  idGrado: number;
  idMateria: number;
  idPeriodo: string;
  estudiantes: any[];
}

interface Competencia {
  idCompetencia: number;
  codigo: string;
  nombre: string;
}

interface ActividadCompetencia {
  idActividadCompetencia: number;
  idCompetencia: number;
  competencia: string;
  nombre: string;
}

const ModuloCompetenciasSecundaria = ({
  idAsignacionDocente,
  idGrado,
  idMateria,
  idPeriodo,
  estudiantes,
}: Props) => {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [actividades, setActividades] = useState<ActividadCompetencia[]>([]);
  const [idCompetencia, setIdCompetencia] = useState("");
  const [nombreActividad, setNombreActividad] = useState("");
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  // Solo controla qué competencia se está visualizando.
  const [competenciaSeleccionada, setCompetenciaSeleccionada] =
    useState<number | null>(null);

  /* =====================================================
     CARGAR COMPETENCIAS
  ===================================================== */

  const cargarCompetencias = async () => {
    try {
      const res = await api.get(
        `/CompetenciasGradoMateria/grado/${idGrado}/materia/${idMateria}`
      );

      const dataNormalizada = res.data.map((c: any) => ({
        idCompetencia: c.idCompetencia ?? c.IdCompetencia,
        codigo: c.codigo ?? c.Codigo,
        nombre: c.nombre ?? c.Nombre,
      }));

      setCompetencias(dataNormalizada);

      // Seleccionar automáticamente la primera competencia
      if (dataNormalizada.length > 0) {
        setCompetenciaSeleccionada(
          dataNormalizada[0].idCompetencia
        );
      }
    } catch (error: any) {
      console.error(
        "ERROR COMPETENCIAS:",
        error.response?.data
      );

      toast.error(
        "Error al cargar competencias: " +
          (error.response?.data ?? error.message)
      );
    }
  };

  /* =====================================================
     CARGAR ACTIVIDADES
  ===================================================== */

  const cargarActividades = async () => {
    if (!idPeriodo) return;

    try {
      const res = await api.get(
        `/ActividadesCompetencias/asignacion/${idAsignacionDocente}/periodo/${idPeriodo}`
      );

      setActividades(
        res.data.map((a: any) => ({
          idActividadCompetencia:
            a.idActividadCompetencia ??
            a.IdActividadCompetencia,

          idCompetencia:
            a.idCompetencia ??
            a.IdCompetencia,

          competencia:
            a.competencia ??
            a.Competencia,

          nombre:
            a.nombre ??
            a.Nombre,
        }))
      );
    } catch (error) {
      console.error(
        "Error cargando actividades",
        error
      );

      toast.error(
        "Error al cargar actividades."
      );
    }
  };

  /* =====================================================
     CARGAR NOTAS
  ===================================================== */

  const cargarNotasGuardadas = async () => {
    if (!idPeriodo) return;

    try {
      const res = await api.get(
        `/NotasCompetencias/asignacion/${idAsignacionDocente}/periodo/${idPeriodo}`
      );

      const notasCargadas: Record<string, string> = {};

      res.data.forEach((n: any) => {
        const idActividad =
          n.idActividadCompetencia ??
          n.IdActividadCompetencia;

        const idEstudiante =
          n.idEstudiante ??
          n.IdEstudiante;

        const nota =
          n.nota ??
          n.Nota;

        notasCargadas[
          `${idActividad}-${idEstudiante}`
        ] = String(nota);

        toast.info(
          `Nota cargada para ${
            estudiantes.find(
              (e) =>
                e.idEstudiante === idEstudiante
            )?.nombre
          }: ${nota}`
        );
      });

      setNotas(notasCargadas);
    } catch (error) {
      console.error(
        "Error cargando notas guardadas",
        error
      );

      toast.error(
        "Error al cargar notas guardadas."
      );
    }
  };

  /* =====================================================
     EFECTOS
  ===================================================== */

  useEffect(() => {
    cargarCompetencias();
  }, [idGrado, idMateria]);

  useEffect(() => {
    cargarActividades();
    cargarNotasGuardadas();
  }, [idPeriodo, idAsignacionDocente]);

  /* =====================================================
     CREAR ACTIVIDAD
  ===================================================== */

  const crearActividad = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!idPeriodo) {
      alert(
        "Debe seleccionar un período."
      );
      return;
    }

    try {
      await api.post(
        "/ActividadesCompetencias",
        {
          idAsignacionDocente,

          idPeriodoPublicacion:
            Number(idPeriodo),

          idCompetencia:
            Number(idCompetencia),

          nombre:
            nombreActividad,
        }
      );

      setIdCompetencia("");
      setNombreActividad("");

      await cargarActividades();
      await cargarNotasGuardadas();

      toast.success(
        "Actividad creada correctamente."
      );
    } catch (error: any) {
      alert(
        error.response?.data ??
          "Error al crear actividad."
      );
    }
  };

  /* =====================================================
     GUARDAR CALIFICACIONES
  ===================================================== */

  const guardarCalificaciones = async () => {
    const notasEnviar: any[] = [];

    for (const actividad of actividades) {
      for (const est of estudiantes) {
        const key =
          `${actividad.idActividadCompetencia}-${est.idEstudiante}`;

        const valor = notas[key];

        if (
          valor === "" ||
          valor === undefined
        ) {
          continue;
        }

        const nota = Number(valor);

        if (
          isNaN(nota) ||
          nota < 0 ||
          nota > 100
        ) {
          alert(
            "Todas las notas deben estar entre 0 y 100."
          );
          return;
        }

        notasEnviar.push({
          idActividadCompetencia:
            actividad.idActividadCompetencia,

          idEstudiante:
            est.idEstudiante,

          nota,
        });
      }
    }

    try {
      await api.post(
        "/NotasCompetencias/guardar-masivo",
        notasEnviar
      );

      toast.success(
        "Calificaciones guardadas correctamente."
      );

      await cargarNotasGuardadas();
    } catch (error: any) {
      alert(
        error.response?.data ??
          "Error al guardar calificaciones."
      );

      toast.error(
        "Error al guardar calificaciones."
      );
    }
  };

  /* =====================================================
     CALCULAR
  ===================================================== */

  const calcular = async () => {
    try {
      await api.post(
        `/CalificacionesCompetenciasPeriodo/calcular?idAsignacionDocente=${idAsignacionDocente}&idPeriodoPublicacion=${idPeriodo}`
      );

      toast.success(
        "Calificaciones calculadas."
      );
    } catch (error: any) {
      alert(
        error.response?.data ??
          "Error al calcular."
      );

      toast.error(
        "Error al calcular."
      );
    }
  };

  /* =====================================================
     PUBLICAR
  ===================================================== */

  const publicar = async () => {
    try {
      await api.put(
        `/CalificacionesCompetenciasPeriodo/publicar?idAsignacionDocente=${idAsignacionDocente}&idPeriodoPublicacion=${idPeriodo}`
      );

      toast.success(
        "Calificaciones publicadas."
      );
    } catch (error: any) {
      toast.error(
        "Error al publicar: " +
          (error.response?.data ??
            error.message)
      );

      alert(
        error.response?.data ??
          "Error al publicar."
      );
    }
  };

  /* =====================================================
     COMPETENCIA ACTUAL
  ===================================================== */

  const competenciaActual =
    competencias.find(
      (c) =>
        c.idCompetencia ===
        competenciaSeleccionada
    );

  /* =====================================================
     ACTIVIDADES DE LA COMPETENCIA ACTUAL
  ===================================================== */

  const actividadesActuales =
    useMemo(() => {
      if (!competenciaSeleccionada) {
        return [];
      }

      return actividades.filter(
        (a) =>
          a.idCompetencia ===
          competenciaSeleccionada
      );
    }, [
      actividades,
      competenciaSeleccionada,
    ]);

  /* =====================================================
     NOTAS REGISTRADAS
  ===================================================== */

  const notasRegistradas =
    useMemo(() => {
      return actividadesActuales.reduce(
        (total, actividad) => {
          const cantidad =
            estudiantes.filter(
              (est) => {
                const key =
                  `${actividad.idActividadCompetencia}-${est.idEstudiante}`;

                return (
                  notas[key] !== undefined &&
                  notas[key] !== ""
                );
              }
            ).length;

          return total + cantidad;
        },
        0
      );
    }, [
      actividadesActuales,
      estudiantes,
      notas,
    ]);

  const totalNotas =
    actividadesActuales.length *
    estudiantes.length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="mc-sec-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mc-sec-header">

        <div>
          <span className="mc-sec-eyebrow">
            EVALUACIÓN ACADÉMICA
          </span>

          <h2>
            Evaluación por competencias
          </h2>

          <p>
            Registra y revisa las calificaciones
            de tus estudiantes.
          </p>
        </div>

        <button
          type="button"
          className="mc-sec-help-button"
          onClick={() =>
            setMostrarAyuda(true)
          }
          title="Ayuda"
        >
          ?
        </button>

      </header>


      {/* =================================================
          COMPETENCIAS
      ================================================= */}

      <section className="mc-sec-summary">

        <div className="mc-sec-summary-heading">

          <div>
            <span>
              PERIODO ACTUAL
            </span>

            <strong>
              Evaluación por competencias
            </strong>
          </div>

          <div className="mc-sec-summary-period">

            <span>
              Periodo
            </span>

            <strong>
              {idPeriodo
                ? "Seleccionado"
                : "Sin seleccionar"}
            </strong>

          </div>

        </div>


        <div className="mc-sec-competency-selector">

          {competencias.map(
            (competencia) => {

              const cantidad =
                actividades.filter(
                  (a) =>
                    a.idCompetencia ===
                    competencia.idCompetencia
                ).length;

              const activa =
                competenciaSeleccionada ===
                competencia.idCompetencia;

              return (
                <button
                  key={
                    competencia.idCompetencia
                  }
                  type="button"
                  className={`mc-sec-competency-tab ${
                    activa
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCompetenciaSeleccionada(
                      competencia.idCompetencia
                    )
                  }
                >

                  <span className="mc-sec-tab-code">
                    {competencia.codigo}
                  </span>

                  <span className="mc-sec-tab-info">

                    <strong>
                      {competencia.nombre}
                    </strong>

                    <small>
                      {cantidad}{" "}
                      {cantidad === 1
                        ? "actividad"
                        : "actividades"}
                    </small>

                  </span>

                  <span className="mc-sec-tab-check">
                    {cantidad >= 3
                      ? "✓"
                      : ""}
                  </span>

                </button>
              );
            }
          )}

        </div>

      </section>


      {/* =================================================
          NUEVA ACTIVIDAD
      ================================================= */}

      <form
        onSubmit={crearActividad}
        className="mc-sec-new-activity"
      >

        <div className="mc-sec-new-icon">
          +
        </div>

        <div className="mc-sec-new-title">

          <strong>
            Nueva actividad
          </strong>

          <span>
            Añade una actividad a una competencia.
          </span>

        </div>


        <select
          value={idCompetencia}
          onChange={(e) =>
            setIdCompetencia(
              e.target.value
            )
          }
          required
        >

          <option value="">
            Seleccione competencia
          </option>

          {competencias.map(
            (c) => (
              <option
                key={c.idCompetencia}
                value={c.idCompetencia}
              >
                {c.codigo} - {c.nombre}
              </option>
            )
          )}

        </select>


        <input
          placeholder="Nombre de la actividad"
          value={nombreActividad}
          onChange={(e) =>
            setNombreActividad(
              e.target.value
            )
          }
          required
        />


        <button
          type="submit"
          className="mc-sec-create-button"
        >
          Crear
        </button>

      </form>


      {/* =================================================
          COMPETENCIA ACTUAL
      ================================================= */}

      {competenciaActual && (

        <section className="mc-sec-grade-section">

          <div className="mc-sec-grade-heading">

            <div>

              <div className="mc-sec-current-code">
                {competenciaActual.codigo}
              </div>

              <h3>
                {competenciaActual.nombre}
              </h3>

              <p>
                {actividadesActuales.length}{" "}
                {actividadesActuales.length === 1
                  ? "actividad registrada"
                  : "actividades registradas"}
              </p>

            </div>


            <div className="mc-sec-progress">

              <strong>
                {notasRegistradas}
                <span>
                  / {totalNotas}
                </span>
              </strong>

              <small>
                notas registradas
              </small>

            </div>

          </div>


          {/* =================================================
              ACTIVIDADES
          ================================================= */}

          {actividadesActuales.length > 0 ? (

            <>

              <div className="mc-sec-activity-pills">

                {actividadesActuales.map(
                  (actividad) => (
                    <div
                      key={
                        actividad.idActividadCompetencia
                      }
                      className="mc-sec-activity-pill"
                    >

                      <span></span>

                      {actividad.nombre}

                    </div>
                  )
                )}

              </div>


              {/* =================================================
                  TABLA CONSOLIDADA
              ================================================= */}

              <div className="mc-sec-table-wrapper">

                <table className="mc-sec-grade-table">

                  <thead>

                    <tr>

                      <th className="student-column">
                        Estudiante
                      </th>

                      {actividadesActuales.map(
                        (actividad) => (
                          <th
                            key={
                              actividad.idActividadCompetencia
                            }
                          >
                            {actividad.nombre}
                          </th>
                        )
                      )}

                    </tr>

                  </thead>


                  <tbody>

                    {estudiantes.map(
                      (est) => (

                        <tr
                          key={
                            est.idEstudiante
                          }
                        >

                          <td className="student-cell">

                            <div className="student-avatar">

                              {(
                                `${est.nombres ?? ""} ${
                                  est.apellidos ?? ""
                                }`
                              )
                                .trim()
                                .substring(
                                  0,
                                  2
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <strong>
                                {est.nombres}{" "}
                                {est.apellidos}
                              </strong>

                              <small>
                                {est.matricula}
                              </small>

                            </div>

                          </td>


                          {actividadesActuales.map(
                            (actividad) => {

                              const key =
                                `${actividad.idActividadCompetencia}-${est.idEstudiante}`;

                              const valor =
                                notas[key] ??
                                "";

                              return (

                                <td
                                  key={key}
                                  className="grade-cell"
                                >

                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={valor}
                                    placeholder="—"
                                    onChange={(e) =>
                                      setNotas(
                                        (prev) => ({
                                          ...prev,
                                          [key]:
                                            e.target.value,
                                        })
                                      )
                                    }
                                  />

                                </td>

                              );
                            }
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </>

          ) : (

            <div className="mc-sec-empty">

              <div className="mc-sec-empty-icon">
                +
              </div>

              <strong>
                Todavía no hay actividades
              </strong>

              <p>
                Crea una actividad para comenzar
                a registrar calificaciones.
              </p>

            </div>

          )}

        </section>

      )}


      {/* =================================================
          ACCIONES
      ================================================= */}

      <footer className="mc-sec-actions">

        <div className="mc-sec-save-state">

          <span></span>

          Listo para guardar

        </div>


        <div className="mc-sec-action-buttons">

          <button
            type="button"
            className="mc-sec-btn secondary"
            onClick={
              guardarCalificaciones
            }
          >
            Guardar calificaciones
          </button>

          <button
            type="button"
            className="mc-sec-btn outline"
            onClick={calcular}
          >
            Calcular competencias
          </button>

          <button
            type="button"
            className="mc-sec-btn primary"
            onClick={publicar}
          >
            Publicar competencias
            <span>→</span>
          </button>

        </div>

      </footer>


      {/* =================================================
          MODAL AYUDA
      ================================================= */}

      {mostrarAyuda && (

        <div className="mc-sec-modal-overlay">

          <div className="mc-sec-modal">

            <button
              type="button"
              className="mc-sec-modal-close"
              onClick={() =>
                setMostrarAyuda(false)
              }
            >
              ×
            </button>

            <div className="mc-sec-modal-icon">
              ?
            </div>

            <span className="mc-sec-eyebrow">
              GUÍA RÁPIDA
            </span>

            <h3>
              ¿Cómo publicar calificaciones?
            </h3>

            <div className="mc-sec-steps">

              <div>
                <b>1</b>
                <span>
                  Seleccione el período correspondiente.
                </span>
              </div>

              <div>
                <b>2</b>
                <span>
                  Cree las actividades de cada competencia.
                </span>
              </div>

              <div>
                <b>3</b>
                <span>
                  Registre las notas de los estudiantes.
                </span>
              </div>

              <div>
                <b>4</b>
                <span>
                  Presione Guardar calificaciones.
                </span>
              </div>

              <div>
                <b>5</b>
                <span>
                  Presione Calcular competencias.
                </span>
              </div>

              <div>
                <b>6</b>
                <span>
                  Finalmente presione Publicar competencias.
                </span>
              </div>

            </div>

            <button
              type="button"
              className="mc-sec-modal-button"
              onClick={() =>
                setMostrarAyuda(false)
              }
            >
              Entendido
            </button>

          </div>

        </div>

      )}


      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

    </div>
  );
};

export default ModuloCompetenciasSecundaria;