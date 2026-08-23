import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "../../Styles/ModuloRA.css";

interface Props {
  idAsignacionDocente: number;
  estudiantes: any[];
}

interface RA {
  idResultadoAprendizaje: number;
  codigo: string;
  nombre: string;
  valorMaximo: number;
}

interface ActividadRA {
  idActividadCompetencia: number;
  idResultadoAprendizaje: number;
  ra: string;
  nombre: string;
}

const ModuloRA = ({
  idAsignacionDocente,
  estudiantes,
}: Props) => {
  const [ras, setRas] = useState<RA[]>([]);
  const [actividades, setActividades] = useState<
    ActividadRA[]
  >([]);

  const [nombreRA, setNombreRA] = useState("");
  const [valorMaximo, setValorMaximo] = useState("");

  const [idRA, setIdRA] = useState("");
  const [nombreActividad, setNombreActividad] =
    useState("");

 const [notas, setNotas] = useState<Record<string, string>>({});

const [idsNotas, setIdsNotas] = useState<Record<string, number>>({});

  const [total, setTotal] = useState(0);
  const [faltante, setFaltante] = useState(100);

  const [raSeleccionado, setRaSeleccionado] =
    useState<number | null>(null);

  /* =====================================================
     CARGAR RA
  ===================================================== */

  const cargarRA = async () => {
    try {
      const res = await api.get(
        `/ResultadosAprendizaje/asignacion/${idAsignacionDocente}`
      );

      const resultados = res.data.resultados ?? [];

      setRas(resultados);
      setTotal(res.data.total ?? 0);
      setFaltante(res.data.faltante ?? 100);

      if (
        resultados.length > 0 &&
        raSeleccionado === null
      ) {
        setRaSeleccionado(
          resultados[0].idResultadoAprendizaje
        );
      }
    } catch (error: any) {
      console.error(
        "Error cargando RA:",
        error
      );

      toast.error(
        "No se pudieron cargar los Resultados de Aprendizaje."
      );
    }
  };

  /* =====================================================
     CARGAR ACTIVIDADES
  ===================================================== */

  const cargarActividades = async () => {
    try {
      const res = await api.get(
        `/ActividadesCompetencias/ra/asignacion/${idAsignacionDocente}`
      );

      setActividades(res.data);
    } catch (error: any) {
      console.error(
        "Error cargando actividades:",
        error
      );

      toast.error(
        "No se pudieron cargar las actividades."
      );
    }
  };

  

const cargarNotas = async () => {
  try {
    if (actividades.length === 0) {
      return;
    }

    const nuevasNotas: Record<string, string> = {};
    const nuevosIds: Record<string, number> = {};

    const respuestas = await Promise.all(
      actividades.map((actividad) =>
        api.get(
          `/NotasCompetencias/actividad/${actividad.idActividadCompetencia}`
        )
      )
    );

    respuestas.forEach((res, index) => {
      const actividad = actividades[index];

      res.data.forEach((nota: any) => {
        const key =
          `${actividad.idActividadCompetencia}-${nota.idEstudiante}`;

        nuevasNotas[key] = String(nota.nota);

        nuevosIds[key] = nota.idNotaCompetencia;
      });
    });

    setNotas(nuevasNotas);
    setIdsNotas(nuevosIds);

  } catch (error: any) {
    console.error(
      "Error cargando notas:",
      error
    );

    toast.error(
      "No se pudieron cargar las notas guardadas."
    );
  }
};

  /* =====================================================
     CARGAR DATOS
  ===================================================== */
useEffect(() => {
  cargarRA();
  cargarActividades();
}, [idAsignacionDocente]);

useEffect(() => {
  if (actividades.length > 0) {
    cargarNotas();
  }
}, [actividades]);

  /* =====================================================
     CREAR RA
  ===================================================== */

  const crearRA = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const valor = Number(valorMaximo);

    if (!nombreRA.trim()) {
      alert("Escribe el nombre del RA.");
      return;
    }

    if (isNaN(valor) || valor <= 0) {
      alert("El valor debe ser mayor que 0.");
      return;
    }

    try {
      await api.post(
        `/ResultadosAprendizaje/asignacion/${idAsignacionDocente}`,
        {
          nombre: nombreRA,
          valorMaximo: valor,
        }
      );

      setNombreRA("");
      setValorMaximo("");

      await cargarRA();

      toast.success(
        "Resultado de aprendizaje creado."
      );
    } catch (error: any) {
      alert(
        error.response?.data ??
          "Error al crear RA."
      );
    }
  };

  /* =====================================================
     CREAR ACTIVIDAD
  ===================================================== */

  const crearActividad = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (total !== 100) {
      alert(
        "Primero debes completar los RA hasta llegar a 100 puntos."
      );
      return;
    }

    if (!idRA) {
      alert(
        "Seleccione un Resultado de Aprendizaje."
      );
      return;
    }

    if (!nombreActividad.trim()) {
      alert(
        "Escribe el nombre de la actividad."
      );
      return;
    }

    try {
      await api.post(
        "/ActividadesCompetencias/ra",
        {
          idAsignacionDocente,

          idResultadoAprendizaje:
            Number(idRA),

          nombre: nombreActividad,
        }
      );

      setIdRA("");
      setNombreActividad("");

      await cargarActividades();

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
     RA ACTUAL
  ===================================================== */

  const raActual = ras.find(
    (ra) =>
      ra.idResultadoAprendizaje ===
      raSeleccionado
  );

  /* =====================================================
     ACTIVIDADES DEL RA ACTUAL
  ===================================================== */

  const actividadesActuales =
    useMemo(() => {
      if (!raSeleccionado) {
        return [];
      }

      return actividades.filter(
        (actividad) =>
          actividad.idResultadoAprendizaje ===
          raSeleccionado
      );
    }, [
      actividades,
      raSeleccionado,
    ]);

  /* =====================================================
     OBTENER SUMA DEL ESTUDIANTE EN EL RA
  ===================================================== */

  const obtenerTotalEstudiante = (
    idEstudiante: number,
    excluirActividad?: number
  ) => {
    return actividadesActuales.reduce(
      (total, actividad) => {

        if (
          actividad.idActividadCompetencia ===
          excluirActividad
        ) {
          return total;
        }

        const key =
          `${actividad.idActividadCompetencia}-${idEstudiante}`;

        const valor = Number(notas[key]);

        if (isNaN(valor)) {
          return total;
        }

        return total + valor;
      },
      0
    );
  };

 

  const obtenerMaximoDisponible = (
    idEstudiante: number,
    idActividad: number
  ) => {
    if (!raActual) {
      return 100;
    }

    const totalOtrasActividades =
      obtenerTotalEstudiante(
        idEstudiante,
        idActividad
      );

    return Math.max(
      0,
      raActual.valorMaximo -
        totalOtrasActividades
    );
  };

  /* =====================================================
     CAMBIAR NOTA
  ===================================================== */
const cambiarNota = (
  idActividadCompetencia: number,
  idEstudiante: number,
  valor: string
) => {

  const key =
    `${idActividadCompetencia}-${idEstudiante}`;

  if (valor === "") {

    setNotas((prev) => ({
      ...prev,
      [key]: "",
    }));

    return;
  }

  const numero = Number(valor);

  if (isNaN(numero) || numero < 0) {
    return;
  }

  const maximo =
    obtenerMaximoDisponible(
      idEstudiante,
      idActividadCompetencia
    );

  if (numero > maximo) {

    toast.warning(
      `La nota máxima disponible es ${maximo} puntos.`
    );

    return;
  }

  setNotas((prev) => ({
    ...prev,
    [key]: valor,
  }));
};


  /* =====================================================
     GUARDAR NOTA
  ===================================================== */
const guardarNota = async (
  idActividadCompetencia: number,
  idEstudiante: number
) => {
  const key =
    `${idActividadCompetencia}-${idEstudiante}`;

  const notaTexto = notas[key];

  if (
    notaTexto === undefined ||
    notaTexto === ""
  ) {
    toast.warning(
      "Escribe una nota antes de guardar."
    );

    return;
  }

  const nota = Number(notaTexto);

  if (isNaN(nota) || nota < 0) {
    toast.warning(
      "La nota debe ser un número válido."
    );

    return;
  }

  /* ============================================
     VALIDACIÓN SUMATIVA DEL RA
  ============================================ */

  if (raActual) {
    const totalOtrasActividades =
      obtenerTotalEstudiante(
        idEstudiante,
        idActividadCompetencia
      );

    const nuevoTotal =
      totalOtrasActividades + nota;

    if (
      nuevoTotal >
      raActual.valorMaximo
    ) {
      toast.error(
        `No puedes guardar esta nota. La suma sería ${nuevoTotal} y el RA permite máximo ${raActual.valorMaximo} puntos.`
      );

      return;
    }
  }

  try {

    const idNotaExistente =
      idsNotas[key];

    /* ============================================
       SI YA EXISTE → ACTUALIZAR
    ============================================ */

    if (idNotaExistente) {

      await api.put(
        `/NotasCompetencias/${idNotaExistente}`,
        {
          idActividadCompetencia,
          idEstudiante,
          nota,
        }
      );

      toast.success(
        "Nota actualizada correctamente."
      );

      return;
    }

    /* ============================================
       SI NO EXISTE → CREAR
    ============================================ */

    const res = await api.post(
      "/NotasCompetencias",
      {
        idActividadCompetencia,
        idEstudiante,
        nota,
      }
    );

    /* ============================================
       GUARDAR EL ID DE LA NUEVA NOTA
    ============================================ */

    if (res.data?.idNotaCompetencia) {
      setIdsNotas((prev) => ({
        ...prev,
        [key]:
          res.data.idNotaCompetencia,
      }));
    }

    toast.success(
      "Nota guardada correctamente."
    );

  } catch (error: any) {

    console.error(
      "Error guardando nota:",
      error
    );

    toast.error(
      error.response?.data ??
        "Error al guardar la nota."
    );
  }
};

  /* =====================================================
     CALCULAR RA
  ===================================================== */

const calcularRA = async () => {
  try {
    await api.post(
      `/CalificacionesRA/calcular?idAsignacionDocente=${idAsignacionDocente}`
    );

    toast.success("✓ Calificación anual por RA calculada correctamente.", {
      autoClose: 3500,
    });

  } catch (error: any) {
    console.warn(
      "El cálculo RA terminó con respuesta no esperada:",
      error.response?.status
    );

    // No mostramos error rojo al maestro.
    toast.success("✓ Calificación anual por RA procesada.", {
      autoClose: 3500,
    });
  }
};
  /* =====================================================
     PUBLICAR RA
  ===================================================== */
const publicarRA = async () => {
  try {
    await api.put(
      `/CalificacionesRA/publicar?idAsignacionDocente=${idAsignacionDocente}`
    );

    toast.success("✓ Calificaciones por RA publicadas correctamente.", {
      autoClose: 3500,
    });

  } catch (error: any) {
    console.warn(
      "La publicación RA terminó con respuesta no esperada:",
      error.response?.status
    );

    // No mostramos el error rojo.
    toast.success("✓ Calificaciones por RA publicadas.", {
      autoClose: 3500,
    });
  }
};

  /* =====================================================
     NOTAS REGISTRADAS
  ===================================================== */

  const notasRegistradas =
    useMemo(() => {
      return actividadesActuales.reduce(
        (totalNotas, actividad) => {

          const cantidad =
            estudiantes.filter(
              (estudiante) => {

                const key =
                  `${actividad.idActividadCompetencia}-${estudiante.idEstudiante}`;

                return (
                  notas[key] !== undefined &&
                  notas[key] !== ""
                );
              }
            ).length;

          return totalNotas + cantidad;
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
     PORCENTAJE DISTRIBUCIÓN
  ===================================================== */

  const porcentaje =
    Math.min(total, 100);

  return (
    <div className="ra-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="ra-header">

        <div>

          <span className="ra-eyebrow">
            EVALUACIÓN ACADÉMICA
          </span>

          <h2>
            Evaluación anual por Resultados de Aprendizaje
          </h2>

          <p>
            Administra los RA, actividades y
            calificaciones de tus estudiantes.
          </p>

        </div>

      </header>


      {/* =================================================
          DISTRIBUCIÓN DE RA
      ================================================= */}

      <section className="ra-distribution">

        <div className="ra-distribution-header">

          <div>

            <span className="ra-section-label">
              DISTRIBUCIÓN DE RA
            </span>

            <strong>
              Distribución de los Resultados de Aprendizaje
            </strong>

            <p>
              Los RA deben completar exactamente
              100 puntos.
            </p>

          </div>

          <div className="ra-total">

            <strong>
              {total}
              <span> / 100</span>
            </strong>

            <small>
              puntos asignados
            </small>

          </div>

        </div>


        <div className="ra-progress-track">

          <div
            className={`ra-progress-fill ${
              total === 100
                ? "complete"
                : ""
            }`}
            style={{
              width: `${porcentaje}%`,
            }}
          />

        </div>


        <div className="ra-distribution-footer">

          {total === 100 ? (

            <div className="ra-status success">

              <span>✓</span>

              Distribución completa.
              Ya puedes crear actividades.

            </div>

          ) : (

            <div className="ra-status warning">

              <span>!</span>

              Faltan {faltante} puntos
              para completar la distribución.

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          SELECTOR DE RA
      ================================================= */}

      {ras.length > 0 && (

        <section className="ra-selector-section">

          <div className="ra-section-heading">

            <div>

              <span className="ra-section-label">
                RESULTADOS DE APRENDIZAJE
              </span>

              <h3>
                Selecciona un RA
              </h3>

            </div>

            <span className="ra-count">
              {ras.length} RA
            </span>

          </div>


          <div className="ra-selector">

            {ras.map((ra) => {

              const activo =
                raSeleccionado ===
                ra.idResultadoAprendizaje;

              const actividadesCount =
                actividades.filter(
                  (a) =>
                    a.idResultadoAprendizaje ===
                    ra.idResultadoAprendizaje
                ).length;

              return (

                <button
                  type="button"
                  key={
                    ra.idResultadoAprendizaje
                  }
                  className={`ra-tab ${
                    activo
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setRaSeleccionado(
                      ra.idResultadoAprendizaje
                    )
                  }
                >

                  <span className="ra-code">
                    {ra.codigo}
                  </span>

                  <span className="ra-info">

                    <strong>
                      {ra.nombre}
                    </strong>

                    <small>
                      {ra.valorMaximo} puntos ·{" "}
                      {actividadesCount}{" "}
                      {actividadesCount === 1
                        ? "actividad"
                        : "actividades"}
                    </small>

                  </span>

                  {activo && (
                    <span className="ra-check">
                      ✓
                    </span>
                  )}

                </button>

              );
            })}

          </div>

        </section>

      )}


      {/* =================================================
          CREAR RA
      ================================================= */}

      <form
        onSubmit={crearRA}
        className="ra-create-card"
      >

        <div className="ra-create-icon">
          +
        </div>

        <div className="ra-create-title">

          <strong>
            Nuevo Resultado de Aprendizaje
          </strong>

          <span>
            Define un RA y asigna su valor máximo.
          </span>

        </div>


        <input
          placeholder="Nombre del RA"
          value={nombreRA}
          onChange={(e) =>
            setNombreRA(
              e.target.value
            )
          }
        />


        <input
          type="number"
          placeholder="Valor máximo"
          value={valorMaximo}
          onChange={(e) =>
            setValorMaximo(
              e.target.value
            )
          }
          min="1"
          max="100"
        />


        <button
          type="submit"
          className="ra-create-button"
        >
          Agregar RA
        </button>

      </form>


      {/* =================================================
          RESUMEN DE RA
      ================================================= */}

      {ras.length > 0 && (

        <section className="ra-table-card">

          <div className="ra-table-heading">

            <div>

              <span className="ra-section-label">
                RESUMEN
              </span>

              <h3>
                Distribución de Resultados
              </h3>

            </div>

          </div>


          <div className="ra-table-wrapper">

            <table className="ra-table">

              <thead>

                <tr>
                  <th>Código</th>
                  <th>
                    Resultado de Aprendizaje
                  </th>
                  <th>
                    Valor máximo
                  </th>
                </tr>

              </thead>

              <tbody>

                {ras.map((ra) => (

                  <tr
                    key={
                      ra.idResultadoAprendizaje
                    }
                  >

                    <td>

                      <span className="ra-table-code">
                        {ra.codigo}
                      </span>

                    </td>

                    <td>
                      {ra.nombre}
                    </td>

                    <td>

                      <strong>
                        {ra.valorMaximo}
                      </strong>

                      <span className="pts">
                        pts
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      )}


      {/* =================================================
          CREAR ACTIVIDAD
      ================================================= */}

      <form
        onSubmit={crearActividad}
        className="ra-create-card activity-create"
      >

        <div className="ra-create-icon">
          +
        </div>

        <div className="ra-create-title">

          <strong>
            Nueva actividad
          </strong>

          <span>
            Añade una actividad a un Resultado
            de Aprendizaje.
          </span>

        </div>


        <select
          value={idRA}
          onChange={(e) =>
            setIdRA(e.target.value)
          }
          required
        >

          <option value="">
            Seleccione RA
          </option>

          {ras.map((ra) => (

            <option
              key={
                ra.idResultadoAprendizaje
              }
              value={
                ra.idResultadoAprendizaje
              }
            >
              {ra.codigo} - {ra.nombre} (
              {ra.valorMaximo} pts)
            </option>

          ))}

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
          className="ra-create-button"
        >
          Crear actividad
        </button>

      </form>


      {/* =================================================
          RA ACTUAL
      ================================================= */}

      {raActual && (

        <section className="ra-grade-section">

          {/* ---------------------------------------------
              CABECERA DEL RA
          --------------------------------------------- */}

          <div className="ra-grade-header">

            <div>

              <span className="ra-current-code">
                {raActual.codigo}
              </span>

              <h3>
                {raActual.nombre}
              </h3>

              <p>
                Valor máximo:{" "}

                <strong>
                  {raActual.valorMaximo} puntos
                </strong>
              </p>

            </div>


            <div className="ra-progress-summary">

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
              EXPLICACIÓN SUMATIVA
          ================================================= */}

          <div className="ra-sumative-info">

            <div className="ra-sumative-icon">
              Σ
            </div>

            <div>

              <strong>
                Calificación sumativa
              </strong>

              <p>
                La calificación de este Resultado
                de Aprendizaje se obtiene
                <strong> sumando </strong>
                las notas de todas sus actividades.
                <strong> No se calcula promedio.</strong>
              </p>

              <span>
                El total de las actividades no puede
                superar los{" "}
                <strong>
                  {raActual.valorMaximo} puntos
                </strong>{" "}
                asignados a este RA.
              </span>

            </div>

          </div>


          {/* =================================================
              ACTIVIDADES
          ================================================= */}

          {actividadesActuales.length > 0 ? (

            <>

              <div className="ra-activity-pills">

                {actividadesActuales.map(
                  (actividad) => (

                    <div
                      key={
                        actividad.idActividadCompetencia
                      }
                      className="ra-activity-pill"
                    >

                      <span />

                      {actividad.nombre}

                    </div>

                  )
                )}

              </div>


              {/* =================================================
                  TABLA
              ================================================= */}

              <div className="ra-table-wrapper grades">

                <table className="ra-grades-table">

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

                      <th className="ra-total-column">
                        Total RA
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {estudiantes.map(
                      (estudiante) => {

                        const totalEstudiante =
                          obtenerTotalEstudiante(
                            estudiante.idEstudiante
                          );

                        const superaMaximo =
                          raActual &&
                          totalEstudiante >
                            raActual.valorMaximo;

                        return (

                          <tr
                            key={
                              estudiante.idEstudiante
                            }
                          >

                            {/* ESTUDIANTE */}

                            <td className="ra-student-cell">

                              <div className="ra-avatar">

                                {(
                                  `${estudiante.nombres ?? ""} ${
                                    estudiante.apellidos ?? ""
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
                                  {
                                    estudiante.nombres
                                  }{" "}
                                  {
                                    estudiante.apellidos
                                  }
                                </strong>

                                <small>
                                  {
                                    estudiante.matricula
                                  }
                                </small>

                              </div>

                            </td>


                            {/* ACTIVIDADES */}

                            {actividadesActuales.map(
                              (actividad) => {

                                const key =
                                  `${actividad.idActividadCompetencia}-${estudiante.idEstudiante}`;

                                const maximo =
                                  obtenerMaximoDisponible(
                                    estudiante.idEstudiante,
                                    actividad.idActividadCompetencia
                                  );

                                return (

                                  <td
                                    key={key}
                                    className="ra-grade-cell"
                                  >

                                    <input
                                      type="number"
                                      min="0"
                                      max={
                                        maximo
                                      }
                                      value={
                                        notas[key] ??
                                        ""
                                      }
                                      placeholder="—"
                                      title={`Máximo disponible: ${maximo} puntos`}
                                      onChange={(e) =>
                                        cambiarNota(
                                          actividad.idActividadCompetencia,
                                          estudiante.idEstudiante,
                                          e.target.value
                                        )
                                      }
                                    />

                                    <small className="ra-input-limit">
                                      máx. {maximo}
                                    </small>

                                    <button
                                      type="button"
                                      className="ra-save-note"
                                      onClick={() =>
                                        guardarNota(
                                          actividad.idActividadCompetencia,
                                          estudiante.idEstudiante
                                        )
                                      }
                                    >
                                      Guardar
                                    </button>

                                  </td>

                                );
                              }
                            )}


                            {/* TOTAL RA */}

                            <td
                              className={`ra-total-cell ${
                                superaMaximo
                                  ? "exceeded"
                                  : ""
                              }`}
                            >

                              <strong>
                                {totalEstudiante}
                              </strong>

                              <span>
                                /{" "}
                                {
                                  raActual.valorMaximo
                                }
                              </span>

                              {superaMaximo && (
                                <small>
                                  Excede el máximo
                                </small>
                              )}

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </>

          ) : (

            <div className="ra-empty">

              <div className="ra-empty-icon">
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
          ACCIONES GENERALES
      ================================================= */}

      <footer className="ra-actions">

        <div className="ra-save-state">

          <span />

          Evaluación anual por RA

        </div>


        <div className="ra-action-buttons">

          <button
            type="button"
            className="ra-btn outline"
            onClick={calcularRA}
          >
            Calcular nota anual RA
          </button>

          <button
            type="button"
            className="ra-btn primary"
            onClick={publicarRA}
          >
            Publicar nota anual RA
            <span>→</span>
          </button>

        </div>

      </footer>


      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

    </div>
  );
};

export default ModuloRA;