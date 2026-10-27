
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  Search,
  Pencil,
  Plus,
  X,
  Power,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axiosConfig";
import "../../Styles/CompetenciasPage.css";
import { confirmar } from "../../Componentes/Notificaciones/Notificaciones";

interface Competencia {
  idCompetencia: number;
  codigo: string;
  nombre: string;
  activa: boolean;
}


interface OpcionAsignacion {
  idGradoMateria: number;
  idGrado: number;
  grado: string;
  idNivel: number;
  nivel: string;
  idMateria: number;
  materia: string;
}

interface CompetenciaAsignada {
  idCompetenciaGradoMateria: number;
  idCompetencia: number;
  codigo: string;
  competencia: string;
  idGrado: number;
  grado: string;
  nivel: string;
  idMateria: number;
  materia: string;
}

const formularioInicial = {
  codigo: "",
  nombre: "",
};

const CompetenciasPage = () => {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState<"catalogo" | "asignaciones">("catalogo");

const [opcionesAsignacion, setOpcionesAsignacion] =
  useState<OpcionAsignacion[]>([]);

const [asignaciones, setAsignaciones] =
  useState<CompetenciaAsignada[]>([]);

const [nivelSeleccionado, setNivelSeleccionado] = useState("");
const [gradoSeleccionado, setGradoSeleccionado] = useState("");
const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState("");
const [descripcionAsignacion, setDescripcionAsignacion] = useState("");
const [cargandoAsignaciones, setCargandoAsignaciones] = useState(false);
const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);

const cargarOpcionesAsignacion = async () => {
  try {
    const respuesta = await api.get<OpcionAsignacion[]>(
      "/Competencias/opciones-asignacion"
    );

    setOpcionesAsignacion(respuesta.data);
  } catch (error) {
    console.error("Error al cargar opciones:", error);
    toast.error("No se pudieron cargar los grados y las materias.");
  }
};

const cargarAsignaciones = async () => {
  setCargandoAsignaciones(true);

  try {
    const respuesta = await api.get<CompetenciaAsignada[]>(
      "/Competencias/asignaciones"
    );

    setAsignaciones(respuesta.data);
  } catch (error) {
    console.error("Error al cargar asignaciones:", error);
    toast.error("No se pudieron cargar las competencias asignadas.");
  } finally {
    setCargandoAsignaciones(false);
  }
};

const nivelesDisponibles = Array.from(
  new Map(
    opcionesAsignacion.map((opcion) => [
      opcion.idNivel,
      { idNivel: opcion.idNivel, nombre: opcion.nivel },
    ])
  ).values()
);

const gradosDisponibles = opcionesAsignacion.filter(
  (opcion, indice, lista) =>
    String(opcion.idNivel) === nivelSeleccionado &&
    lista.findIndex(
      (otro) =>
        otro.idNivel === opcion.idNivel &&
        otro.idGrado === opcion.idGrado
    ) === indice
);

const materiasDisponibles = opcionesAsignacion.filter(
  (opcion) =>
    String(opcion.idNivel) === nivelSeleccionado &&
    String(opcion.idGrado) === gradoSeleccionado
);

const opcionElegida = materiasDisponibles.find(
  (opcion) => String(opcion.idMateria) === materiaSeleccionada
);

const competenciasActivas = competencias.filter(
  (competencia) => competencia.activa
);

const asignarCompetencia = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (
    !opcionElegida ||
    !competenciaSeleccionada
  ) {
    toast.warning("Selecciona el grado, la materia y la competencia.");
    return;
  }

  setGuardandoAsignacion(true);

  try {
    await api.post("/Competencias/asignaciones", {
      idGrado: opcionElegida.idGrado,
      idMateria: opcionElegida.idMateria,
      idCompetencia: Number(competenciaSeleccionada),
      descripcion: descripcionAsignacion.trim() || null,
    });

    toast.success("Competencia asignada correctamente.");

    setCompetenciaSeleccionada("");
    setDescripcionAsignacion("");

    await cargarAsignaciones();
  } catch (error: any) {
    console.error("Error al asignar competencia:", error);

    const mensaje =
      typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message ??
          "No se pudo asignar la competencia.";

    toast.error(mensaje);
  } finally {
    setGuardandoAsignacion(false);
  }
};

const eliminarAsignacion = async (
  asignacion: CompetenciaAsignada
) => {
  const confirmado = await confirmar({
    titulo: "Quitar competencia",
    mensaje: `¿Quitar "${asignacion.competencia}" de ${asignacion.grado} - ${asignacion.materia}?`,
    textoConfirmar: "Sí, quitar",
    tipo: "peligro",
  });

  if (!confirmado) return;

  try {
    await api.delete(
      `/Competencias/asignaciones/${asignacion.idCompetenciaGradoMateria}`
    );

    toast.success("Asignación eliminada correctamente.");
    await cargarAsignaciones();
  } catch (error: any) {
    console.error("Error al eliminar asignación:", error);

    toast.error(
      error.response?.data?.message ??
        "No se pudo eliminar la asignación."
    );
  }
};

  const cargarCompetencias = async () => {
    setCargando(true);

    try {
      const respuesta = await api.get<Competencia[]>("/Competencias");
      setCompetencias(respuesta.data);
    } catch (error) {
      console.error("Error al cargar competencias:", error);
      toast.error("No se pudieron cargar las competencias.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
  void cargarCompetencias();
  void cargarOpcionesAsignacion();
  void cargarAsignaciones();
  }, []);

  const actualizarCampo = (
    campo: "codigo" | "nombre",
    valor: string
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
  };

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const codigo = formulario.codigo.trim();
    const nombre = formulario.nombre.trim();

    if (!codigo || !nombre) {
      toast.warning("Completa el código y el nombre.");
      return;
    }

    const payload = { codigo, nombre };

    setGuardando(true);

    try {
      if (editandoId !== null) {
        await api.put(`/Competencias/${editandoId}`, payload);
        toast.success("Competencia actualizada correctamente.");
      } else {
        await api.post("/Competencias", payload);
        toast.success("Competencia creada correctamente.");
      }

      limpiarFormulario();
      await cargarCompetencias();
    } catch (error: any) {
      console.error("Error al guardar competencia:", error);

      const mensaje =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ??
            "No se pudo guardar la competencia.";

      toast.error(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const editar = (competencia: Competencia) => {
    setEditandoId(competencia.idCompetencia);
    setFormulario({
      codigo: competencia.codigo,
      nombre: competencia.nombre,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cambiarEstado = async (competencia: Competencia) => {
    const accion = competencia.activa ? "desactivar" : "activar";

    if (
      !(await confirmar({
        titulo: competencia.activa ? "Desactivar competencia" : "Activar competencia",
        mensaje: `¿Deseas ${accion} la competencia "${competencia.nombre}"?`,
        textoConfirmar: `Sí, ${accion}`,
        tipo: competencia.activa ? "peligro" : "info",
      }))
    ) {
      return;
    }

    try {
      await api.put(
        `/Competencias/${competencia.idCompetencia}/estado`
      );

      toast.success(
        `Competencia ${competencia.activa ? "desactivada" : "activada"} correctamente.`
      );

      await cargarCompetencias();
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);

      toast.error(
        error.response?.data?.message ??
          "No se pudo cambiar el estado de la competencia."
      );
    }
  };

  const competenciasFiltradas = competencias.filter((competencia) => {
    const termino = busqueda.trim().toLowerCase();

    return (
      competencia.codigo.toLowerCase().includes(termino) ||
      competencia.nombre.toLowerCase().includes(termino)
    );
  });

  const activas = competencias.filter((c) => c.activa).length;
  const inactivas = competencias.length - activas;

  return (
    <div className="competencias-page">
      <header className="competencias-header">
        <div>
          <span className="competencias-eyebrow">
            GESTIÓN ACADÉMICA
          </span>

          <h1>Gestión de competencias</h1>

          <p>
            Administra las competencias utilizadas en la evaluación
            de los estudiantes.
          </p>
        </div>

        <button
          type="button"
          className="competencias-btn competencias-btn-secondary"
          onClick={() => void cargarCompetencias()}
          disabled={cargando}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <nav className="competencias-tabs" aria-label="Secciones de competencias">
        <button
          type="button"
          className={`competencias-tab ${tabActiva === "catalogo" ? "activa" : ""}`}
          onClick={() => setTabActiva("catalogo")}
        >
          <BookOpenCheck size={17} />
          Catálogo de competencias
        </button>
        <button
          type="button"
          className={`competencias-tab ${tabActiva === "asignaciones" ? "activa" : ""}`}
          onClick={() => setTabActiva("asignaciones")}
        >
          <Plus size={17} />
          Asignar a grados y materias
        </button>
      </nav>

      {tabActiva === "catalogo" ? (
        <>
      <section className="competencias-resumen">
        <article className="competencias-stat">
          <div className="competencias-stat-icon">
            <BookOpenCheck size={22} />
          </div>
          <div>
            <span>Total de competencias</span>
            <strong>{competencias.length}</strong>
          </div>
        </article>

        <article className="competencias-stat">
          <div className="competencias-stat-icon activa">
            <Power size={22} />
          </div>
          <div>
            <span>Competencias activas</span>
            <strong>{activas}</strong>
          </div>
        </article>

        <article className="competencias-stat">
          <div className="competencias-stat-icon inactiva">
            <Power size={22} />
          </div>
          <div>
            <span>Competencias inactivas</span>
            <strong>{inactivas}</strong>
          </div>
        </article>
      </section>

      <section className="competencias-panel">
        <div className="competencias-panel-header">
          <div>
            <h2>
              {editandoId !== null
                ? "Editar competencia"
                : "Registrar competencia"}
            </h2>
            <p>
              Introduce el código y el nombre de la competencia.
            </p>
          </div>
        </div>

        <form className="competencias-form" onSubmit={guardar}>
          <div className="competencias-field">
            <label htmlFor="codigoCompetencia">
              Código
            </label>
            <input
              id="codigoCompetencia"
              value={formulario.codigo}
              onChange={(e) =>
                actualizarCampo("codigo", e.target.value)
              }
              placeholder="Ej. COMP-001"
              maxLength={50}
              required
            />
          </div>

          <div className="competencias-field">
            <label htmlFor="nombreCompetencia">
              Nombre de la competencia
            </label>
            <input
              id="nombreCompetencia"
              value={formulario.nombre}
              onChange={(e) =>
                actualizarCampo("nombre", e.target.value)
              }
              placeholder="Escribe el nombre de la competencia"
              maxLength={250}
              required
            />
          </div>

          <div className="competencias-form-actions">
            <button
              type="submit"
              className="competencias-btn competencias-btn-primary"
              disabled={guardando}
            >
              <Plus size={18} />
              {guardando
                ? "Guardando..."
                : editandoId !== null
                  ? "Guardar cambios"
                  : "Crear competencia"}
            </button>

            {editandoId !== null && (
              <button
                type="button"
                className="competencias-btn competencias-btn-secondary"
                onClick={limpiarFormulario}
                disabled={guardando}
              >
                <X size={18} />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="competencias-panel">
        <div className="competencias-panel-header competencias-list-header">
          <div>
            <h2>Catálogo de competencias</h2>
            <p>
              {competenciasFiltradas.length} resultado(s)
            </p>
          </div>

          <div className="competencias-search">
            <Search size={18} />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o nombre..."
              aria-label="Buscar competencias"
            />
          </div>
        </div>

        <div className="competencias-table-wrapper">
          <table className="competencias-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Competencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4} className="competencias-empty">
                    Cargando competencias...
                  </td>
                </tr>
              ) : competenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="competencias-empty">
                    {busqueda
                      ? "No hay competencias que coincidan con la búsqueda."
                      : "Todavía no hay competencias registradas."}
                  </td>
                </tr>
              ) : (
                competenciasFiltradas.map((competencia) => (
                  <tr key={competencia.idCompetencia}>
                    <td>
                      <span className="competencias-codigo">
                        {competencia.codigo}
                      </span>
                    </td>

                    <td>{competencia.nombre}</td>

                    <td>
                      <span
                        className={`competencias-badge ${
                          competencia.activa ? "activa" : "inactiva"
                        }`}
                      >
                        {competencia.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td>
                      <div className="competencias-row-actions">
                        <button
                          type="button"
                          className="competencias-icon-btn"
                          title="Editar competencia"
                          aria-label={`Editar ${competencia.nombre}`}
                          onClick={() => editar(competencia)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="competencias-icon-btn"
                          title={
                            competencia.activa
                              ? "Desactivar competencia"
                              : "Activar competencia"
                          }
                          aria-label={`${
                            competencia.activa ? "Desactivar" : "Activar"
                          } ${competencia.nombre}`}
                          onClick={() =>
                            void cambiarEstado(competencia)
                          }
                        >
                          <Power size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
        </>
      ) : (
        <div className="competencias-asignaciones">
          <section className="competencias-panel">
            <div className="competencias-panel-header">
              <div>
                <h2>Asignar competencia</h2>
                <p>Selecciona el nivel, grado, materia y competencia que utilizará el docente.</p>
              </div>
              <button
                type="button"
                className="competencias-btn competencias-btn-secondary"
                onClick={() => {
                  void cargarOpcionesAsignacion();
                  void cargarAsignaciones();
                  void cargarCompetencias();
                }}
                disabled={cargandoAsignaciones || cargando}
              >
                <RefreshCw size={17} />
                Actualizar
              </button>
            </div>

            <form className="competencias-form" onSubmit={asignarCompetencia}>
              <div className="competencias-field">
                <label htmlFor="nivelAsignacion">Nivel</label>
                <select
                  id="nivelAsignacion"
                  value={nivelSeleccionado}
                  onChange={(e) => {
                    setNivelSeleccionado(e.target.value);
                    setGradoSeleccionado("");
                    setMateriaSeleccionada("");
                  }}
                  required
                >
                  <option value="">Selecciona un nivel</option>
                  {nivelesDisponibles.map((nivel) => (
                    <option key={nivel.idNivel} value={nivel.idNivel}>
                      {nivel.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="competencias-field">
                <label htmlFor="gradoAsignacion">Grado</label>
                <select
                  id="gradoAsignacion"
                  value={gradoSeleccionado}
                  onChange={(e) => {
                    setGradoSeleccionado(e.target.value);
                    setMateriaSeleccionada("");
                  }}
                  disabled={!nivelSeleccionado}
                  required
                >
                  <option value="">Selecciona un grado</option>
                  {gradosDisponibles.map((grado) => (
                    <option key={grado.idGrado} value={grado.idGrado}>
                      {grado.grado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="competencias-field">
                <label htmlFor="materiaAsignacion">Materia</label>
                <select
                  id="materiaAsignacion"
                  value={materiaSeleccionada}
                  onChange={(e) => setMateriaSeleccionada(e.target.value)}
                  disabled={!gradoSeleccionado}
                  required
                >
                  <option value="">Selecciona una materia</option>
                  {materiasDisponibles
                    .filter((opcion, indice, lista) =>
                      lista.findIndex((otra) => otra.idMateria === opcion.idMateria) === indice
                    )
                    .map((materia) => (
                      <option key={materia.idMateria} value={materia.idMateria}>
                        {materia.materia}
                      </option>
                    ))}
                </select>
              </div>

              <div className="competencias-field">
                <label htmlFor="competenciaAsignacion">Competencia</label>
                <select
                  id="competenciaAsignacion"
                  value={competenciaSeleccionada}
                  onChange={(e) => setCompetenciaSeleccionada(e.target.value)}
                  required
                >
                  <option value="">Selecciona una competencia</option>
                  {competenciasActivas.map((competencia) => (
                    <option key={competencia.idCompetencia} value={competencia.idCompetencia}>
                      {competencia.codigo} — {competencia.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="competencias-field">
                <label htmlFor="descripcionAsignacion">Descripción (opcional)</label>
                <input
                  id="descripcionAsignacion"
                  value={descripcionAsignacion}
                  onChange={(e) => setDescripcionAsignacion(e.target.value)}
                  placeholder="Descripción específica para este grado y materia"
                  maxLength={500}
                />
              </div>

              <div className="competencias-form-actions">
                <button
                  type="submit"
                  className="competencias-btn competencias-btn-primary"
                  disabled={guardandoAsignacion || competenciasActivas.length === 0 || opcionesAsignacion.length === 0}
                >
                  <Plus size={18} />
                  {guardandoAsignacion ? "Asignando..." : "Asignar competencia"}
                </button>
              </div>
            </form>
          </section>

          <section className="competencias-panel">
            <div className="competencias-panel-header competencias-list-header">
              <div>
                <h2>Competencias asignadas</h2>
                <p>{asignaciones.length} asignación(es)</p>
              </div>
              <button
                type="button"
                className="competencias-btn competencias-btn-secondary"
                onClick={() => void cargarAsignaciones()}
                disabled={cargandoAsignaciones}
              >
                <RefreshCw size={17} />
                Actualizar lista
              </button>
            </div>

            <div className="competencias-table-wrapper">
              <table className="competencias-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Competencia</th>
                    <th>Nivel</th>
                    <th>Grado</th>
                    <th>Materia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoAsignaciones ? (
                    <tr>
                      <td colSpan={6} className="competencias-empty">Cargando asignaciones...</td>
                    </tr>
                  ) : asignaciones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="competencias-empty">
                        Todavía no hay competencias asignadas.
                      </td>
                    </tr>
                  ) : (
                    asignaciones.map((asignacion) => (
                      <tr key={asignacion.idCompetenciaGradoMateria}>
                        <td>
                          <span className="competencias-codigo">{asignacion.codigo}</span>
                        </td>
                        <td>{asignacion.competencia}</td>
                        <td>{asignacion.nivel}</td>
                        <td>{asignacion.grado}</td>
                        <td>{asignacion.materia}</td>
                        <td>
                          <div className="competencias-row-actions">
                            <button
                              type="button"
                              className="competencias-icon-btn"
                              title="Quitar asignación"
                              aria-label={`Quitar ${asignacion.competencia} de ${asignacion.grado}`}
                              onClick={() => void eliminarAsignacion(asignacion)}
                            >
                              <X size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default CompetenciasPage;
