import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

interface Maestro {
  idMaestro: number;
  nombres: string;
  apellidos: string;
  activo: boolean;
}

interface Curso {
  idCurso: number;
  nombre: string;
  grado: string;
  nivel: string;
  activo: boolean;
}

interface Materia {
  idMateria: number;
  nombre: string;
  activa: boolean;
}

interface AnioEscolar {
  idAnioEscolar: number;
  nombre: string;
  activo: boolean;
  cerrado: boolean;
}

interface Asignacion {
  idAsignacionDocente: number;
  idMaestro: number;
  maestro: string;
  idCurso: number;
  curso: string;
  grado: string;
  idMateria: number;
  materia: string;
  idAnioEscolar: number;
  anioEscolar: string;
  activo: boolean;
  fechaAsignacion: string;
}

const AsignacionesDocentesPage = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [anios, setAnios] = useState<AnioEscolar[]>([]);

  const [idMaestro, setIdMaestro] = useState("");
  const [idCurso, setIdCurso] = useState("");
  const [idMateria, setIdMateria] = useState("");
  const [idAnioEscolar, setIdAnioEscolar] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarDatos = async () => {
    try {
      const [
        resAsignaciones,
        resMaestros,
        resCursos,
        resMaterias,
        resAnios,
      ] = await Promise.all([
        api.get("/AsignacionesDocentes"),
        api.get("/Maestros"),
        api.get("/Cursos"),
        api.get("/Materias"),
        api.get("/AniosEscolares"),
      ]);

      setAsignaciones(resAsignaciones.data);
      setMaestros(resMaestros.data);
      setCursos(resCursos.data);
      setMaterias(resMaterias.data);
      setAnios(resAnios.data);
    } catch (error: any) {
      console.error("ERROR CARGANDO ASIGNACIONES:", error);

      toast.error(
        error.response?.data ||
          "No se pudieron cargar los datos."
      );
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiar = () => {
    setIdMaestro("");
    setIdCurso("");
    setIdMateria("");
    setIdAnioEscolar("");
    setEditandoId(null);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      idMaestro: Number(idMaestro),
      idCurso: Number(idCurso),
      idMateria: Number(idMateria),
      idAnioEscolar: Number(idAnioEscolar),
    };

    console.log("ASIGNACIÓN QUE SE ENVÍA:", payload);

    try {
      if (editandoId) {
        await api.put(
          `/AsignacionesDocentes/${editandoId}`,
          payload
        );

        toast.success(
          "Asignación actualizada exitosamente."
        );
      } else {
        await api.post(
          "/AsignacionesDocentes",
          payload
        );

        toast.success(
          "Asignación creada exitosamente."
        );
      }

      limpiar();
      await cargarDatos();

    } catch (error: any) {
      console.error(
        "ERROR AL CREAR ASIGNACIÓN:",
        error
      );

      console.error(
        "RESPUESTA DEL BACKEND:",
        error.response?.data
      );

      const mensaje =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.mensaje ||
            "No se pudo guardar la asignación.";

      toast.error(mensaje);
    }
  };

  const editar = (a: Asignacion) => {
    setEditandoId(a.idAsignacionDocente);
    setIdMaestro(String(a.idMaestro));
    setIdCurso(String(a.idCurso));
    setIdMateria(String(a.idMateria));
    setIdAnioEscolar(String(a.idAnioEscolar));
  };

  const cambiarEstado = async (id: number) => {
    try {
      await api.put(
        `/AsignacionesDocentes/${id}/estado`
      );

      toast.success(
        "Estado actualizado correctamente."
      );

      await cargarDatos();
    } catch (error: any) {
      toast.error(
        error.response?.data ||
          "No se pudo cambiar el estado."
      );
    }
  };

  return (
    <div>
      <h1>Asignaciones Docentes</h1>

      <form
        onSubmit={guardar}
        className="form-card"
      >
        {/* MAESTRO */}
        <select
          value={idMaestro}
          onChange={(e) =>
            setIdMaestro(e.target.value)
          }
          required
        >
          <option value="">
            Seleccione maestro
          </option>

          {maestros
            .filter((m) => m.activo)
            .map((m) => (
              <option
                key={m.idMaestro}
                value={m.idMaestro}
              >
                {m.nombres} {m.apellidos}
              </option>
            ))}
        </select>

        {/* CURSO */}
        <select
          value={idCurso}
          onChange={(e) =>
            setIdCurso(e.target.value)
          }
          required
        >
          <option value="">
            Seleccione curso
          </option>

          {cursos
            .filter((c) => c.activo)
            .map((c) => (
              <option
                key={c.idCurso}
                value={c.idCurso}
              >
                {c.nivel} - {c.grado} - {c.nombre}
              </option>
            ))}
        </select>

        {/* MATERIA */}
        <select
          value={idMateria}
          onChange={(e) =>
            setIdMateria(e.target.value)
          }
          required
        >
          <option value="">
            Seleccione materia
          </option>

          {materias
            .filter((m) => m.activa)
            .map((m) => (
              <option
                key={m.idMateria}
                value={m.idMateria}
              >
                {m.nombre}
              </option>
            ))}
        </select>

        {/* AÑO ESCOLAR */}
        <select
          value={idAnioEscolar}
          onChange={(e) =>
            setIdAnioEscolar(e.target.value)
          }
          required
        >
          <option value="">
            Seleccione año
          </option>

          {anios
            .filter((a) => !a.cerrado)
            .map((a) => (
              <option
                key={a.idAnioEscolar}
                value={a.idAnioEscolar}
              >
                {a.nombre}
                {a.activo ? " (Activo)" : ""}
              </option>
            ))}
        </select>

        <button type="submit">
          {editandoId
            ? "Actualizar"
            : "Asignar"}
        </button>

        {editandoId && (
          <button
            type="button"
            onClick={limpiar}
          >
            Cancelar
          </button>
        )}
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Maestro</th>
            <th>Curso</th>
            <th>Grado</th>
            <th>Materia</th>
            <th>Año</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {asignaciones.map((a) => (
            <tr
              key={a.idAsignacionDocente}
            >
              <td>
                {a.idAsignacionDocente}
              </td>

              <td>{a.maestro}</td>

              <td>{a.curso}</td>

              <td>{a.grado}</td>

              <td>{a.materia}</td>

              <td>{a.anioEscolar}</td>

              <td>
                {a.activo
                  ? "Activa"
                  : "Inactiva"}
              </td>

              <td>
                <button
                  onClick={() => editar(a)}
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    cambiarEstado(
                      a.idAsignacionDocente
                    )
                  }
                >
                  {a.activo
                    ? "Desactivar"
                    : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AsignacionesDocentesPage;