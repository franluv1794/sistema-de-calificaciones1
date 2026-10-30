import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { mensajeError } from "../../Componentes/Notificaciones/Notificaciones";
import FiltrosBusqueda, {
  opcionesUnicas,
} from "../../Componentes/FiltrosBusqueda/FiltrosBusqueda";
import Paginacion from "../../Componentes/Paginacion/Paginacion";
import { usePaginado } from "../../Componentes/Paginacion/usePaginado";

interface Estudiante {
  idEstudiante: number;
  matricula: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  activo: boolean;
  usuario: string | null;
  cursoActual: string | null;
  grado?: string | null;
  nivel?: string | null;
  Nivel?: string | null;
  centroId?: number | null;
  centro?: string | null;
}

const nivelDe = (e: Estudiante) => e.nivel ?? e.Nivel ?? null;

interface AnioEscolar {
  idAnioEscolar: number;
  nombre: string;
  activo: boolean;
}

interface OpcionesFiltros {
  centros: string[];
  combinaciones: {
    centro: string | null;
    nivel: string | null;
    grado: string | null;
    curso: string | null;
  }[];
}

const EstudiantesPage = () => {
  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [opciones, setOpciones] = useState<OpcionesFiltros>({
    centros: [],
    combinaciones: [],
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [idAnioEscolar, setIdAnioEscolar] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCentro, setFiltroCentro] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const listado = usePaginado<Estudiante>("/Estudiantes/paginado", {
    busqueda: busqueda.trim(),
    centro: filtroCentro,
    nivel: filtroNivel,
    grado: filtroGrado,
    curso: filtroCurso,
    estado: filtroEstado,
  });
  const estudiantes = listado.items;

  useEffect(() => {
    if (listado.error) {
      console.error("Error cargando estudiantes:", listado.error);
      toast.error("No se pudieron cargar los estudiantes.");
    }
  }, [listado.error]);

  const cargarOpciones = async () => {
    try {
      const [resAnios, resFiltros] = await Promise.all([
        api.get("/AniosEscolares"),
        api.get("/Estudiantes/filtros"),
      ]);

      setAnios(resAnios.data);
      setOpciones(resFiltros.data);
    } catch (error) {
      console.error("Error cargando opciones:", error);
    }
  };

  useEffect(() => {
    cargarOpciones();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([listado.recargar(), cargarOpciones()]);
  };

  const importarExcel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivo || !idAnioEscolar) {
      toast.warning("Selecciona un archivo y un año escolar.");
      return;
    }

    try {
      setCargando(true);

      const formData = new FormData();
      formData.append("archivo", archivo);

      const res = await api.post(
        `/ImportacionExcel/estudiantes?idAnioEscolar=${idAnioEscolar}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResultado(res.data);
      setArchivo(null);

      // Volver a cargar la lista después de importar
      await cargarDatos();
    } catch (error: any) {
      console.error("Error importando estudiantes:", error);

      toast.error(
        mensajeError(error, "Ocurrió un error al importar los estudiantes.")
      );
    } finally {
      setCargando(false);
    }
  };

  // Cada filtro solo ofrece opciones que existen con los filtros anteriores
  const porCentro = useMemo(
    () => opciones.combinaciones.filter((c) => !filtroCentro || c.centro === filtroCentro),
    [opciones, filtroCentro]
  );
  const porNivel = useMemo(
    () => porCentro.filter((c) => !filtroNivel || c.nivel === filtroNivel),
    [porCentro, filtroNivel]
  );
  const porGrado = useMemo(
    () => porNivel.filter((c) => !filtroGrado || c.grado === filtroGrado),
    [porNivel, filtroGrado]
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroCentro("");
    setFiltroNivel("");
    setFiltroGrado("");
    setFiltroCurso("");
    setFiltroEstado("");
  };

  const cambiarEstado = async (id: number) => {
    try {
      await api.put(`/Estudiantes/${id}/estado`);

      await cargarDatos();
    } catch (error: any) {
      console.error("Error cambiando estado:", error);

      toast.error(
        mensajeError(error, "No se pudo cambiar el estado del estudiante.")
      );
    }
  };

  return (
    <div>
      <h1>Estudiantes</h1>

      {/* IMPORTAR ESTUDIANTES */}
      <form onSubmit={importarExcel} className="form-card">
        <select
          value={idAnioEscolar}
          onChange={(e) => setIdAnioEscolar(e.target.value)}
          required
        >
          <option value="">Seleccione año escolar</option>

          {anios.map((anio) => (
            <option
              key={anio.idAnioEscolar}
              value={anio.idAnioEscolar}
            >
              {anio.nombre} {anio.activo ? "(Activo)" : ""}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) =>
            setArchivo(e.target.files?.[0] ?? null)
          }
          required
        />

        <button type="submit" disabled={cargando}>
          {cargando ? "Procesando..." : "Importar estudiantes"}
        </button>
      </form>

      {/* RESULTADO DE IMPORTACIÓN */}
      {resultado && (
        <div
          className="card"
          style={{ marginBottom: 20 }}
        >
          <h3>Resultado de importación</h3>

          <p>
            Total: {resultado.total}
          </p>

          <p>
            Exitosos: {resultado.exitosos}
          </p>

          <p>
            Fallidos: {resultado.fallidos}
          </p>

          {resultado.errores?.length > 0 && (
            <ul>
              {resultado.errores.map(
                (err: any, index: number) => (
                  <li key={index}>
                    Fila {err.fila}: {err.error}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}

      {/* FILTROS */}
      <FiltrosBusqueda
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        placeholder="Buscar por nombre, matrícula o correo..."
        onLimpiar={limpiarFiltros}
        filtros={[
          {
            clave: "centro",
            etiqueta: "Centro",
            valor: filtroCentro,
            opciones: opcionesUnicas(opciones.centros),
            onChange: (v) => {
              setFiltroCentro(v);
              setFiltroNivel("");
              setFiltroGrado("");
              setFiltroCurso("");
            },
          },
          {
            clave: "nivel",
            etiqueta: "Nivel",
            valor: filtroNivel,
            opciones: opcionesUnicas(porCentro.map((c) => c.nivel)),
            onChange: (v) => {
              setFiltroNivel(v);
              setFiltroGrado("");
              setFiltroCurso("");
            },
          },
          {
            clave: "grado",
            etiqueta: "Grado",
            valor: filtroGrado,
            opciones: opcionesUnicas(porNivel.map((c) => c.grado)),
            onChange: (v) => {
              setFiltroGrado(v);
              setFiltroCurso("");
            },
          },
          {
            clave: "curso",
            etiqueta: "Curso",
            valor: filtroCurso,
            opciones: opcionesUnicas(porGrado.map((c) => c.curso)),
            onChange: setFiltroCurso,
          },
          {
            clave: "estado",
            etiqueta: "Estado",
            valor: filtroEstado,
            opciones: ["Activo", "Inactivo"],
            onChange: setFiltroEstado,
          },
        ]}
      />

      {/* TABLA */}
      <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Matrícula</th>
            <th>Usuario</th>
            <th>Estudiante</th>
            <th>Centro</th>
            <th>Nivel</th>
            <th>Grado</th>
            <th>Curso</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {listado.cargando && estudiantes.length === 0 ? (
            <tr>
              <td colSpan={12} style={{ textAlign: "center" }}>
                Cargando estudiantes...
              </td>
            </tr>
          ) : estudiantes.length === 0 ? (
            <tr>
              <td colSpan={12} style={{ textAlign: "center" }}>
                No hay estudiantes que coincidan.
              </td>
            </tr>
          ) : (
            estudiantes.map((e) => (
              <tr key={e.idEstudiante}>
                <td>{e.idEstudiante}</td>

                <td>{e.matricula}</td>

                <td>{e.usuario ?? "—"}</td>

                <td>
                  {e.nombres} {e.apellidos}
                </td>

                <td>{e.centro ?? "—"}</td>

                <td>{nivelDe(e) ?? "—"}</td>

                <td>{e.grado ?? "—"}</td>

                <td>{e.cursoActual ?? "—"}</td>

                <td>{e.telefono ?? "—"}</td>

                <td>{e.correo ?? "—"}</td>

                <td>
                  {e.activo ? "Activo" : "Inactivo"}
                </td>

                <td>
                  <button
                    onClick={() =>
                      cambiarEstado(e.idEstudiante)
                    }
                  >
                    {e.activo
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      <Paginacion
        pagina={listado.pagina}
        totalPaginas={listado.totalPaginas}
        total={listado.total}
        tamanoPagina={listado.tamanoPagina}
        onPagina={listado.setPagina}
        onTamano={listado.cambiarTamano}
        cargando={listado.cargando}
      />
    </div>
  );
};

export default EstudiantesPage;