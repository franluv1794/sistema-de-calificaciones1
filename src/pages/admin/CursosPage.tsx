import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

interface Grado {
  idGrado: number;
  nombre: string;
  nivel: string;
}

interface Curso {
  idCurso: number;
  nombre: string;
  seccion: string;
  activo: boolean;
  idGrado: number;
  grado: string;
  nivel: string;
  centroId: number | null;
  centro: string | null;
}

const centros = [
  {
    id: 1,
    nombre: "Etv",
  },
  {
    id: 2,
    nombre: "Campo Nueva Esperanza",
  },
];

const CursosPage = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);

  const [idGrado, setIdGrado] = useState("");
  const [centroId, setCentroId] = useState("");
  const [nombre, setNombre] = useState("");
  const [seccion, setSeccion] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const esAdministrador =
    user?.rol === "Administrador";

  const cargarDatos = async () => {
    try {
      const [resCursos, resGrados] =
        await Promise.all([
          api.get("/Cursos"),
          api.get("/Grados"),
        ]);

      setCursos(resCursos.data);
      setGrados(resGrados.data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los datos.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiar = () => {
    setIdGrado("");
    setCentroId("");
    setNombre("");
    setSeccion("");
    setEditandoId(null);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        idGrado: Number(idGrado),
        nombre,
        seccion,

        // Solo el Administrador manda el centro.
        ...(esAdministrador && {
          idCentro: Number(centroId),
        }),
      };

      if (editandoId) {
        await api.put(
          `/Cursos/${editandoId}`,
          payload
        );

        toast.success(
          "Curso actualizado exitosamente."
        );
      } else {
        await api.post("/Cursos", payload);

        toast.success(
          "Curso creado exitosamente."
        );
      }

      limpiar();
      await cargarDatos();

    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data ??
          "No se pudo guardar el curso."
      );
    }
  };

  const editar = (curso: Curso) => {
    setEditandoId(curso.idCurso);
    setIdGrado(String(curso.idGrado));
    setCentroId(
      curso.centroId
        ? String(curso.centroId)
        : ""
    );
    setNombre(curso.nombre);
    setSeccion(curso.seccion ?? "");
  };

  const cambiarEstado = async (id: number) => {
    try {
      await api.put(`/Cursos/${id}/estado`);

      toast.success(
        "Estado actualizado correctamente."
      );

      await cargarDatos();

    } catch (error: any) {
      toast.error(
        error.response?.data ??
          "No se pudo cambiar el estado."
      );
    }
  };

  const eliminar = async (id: number) => {
    if (
      !confirm(
        "¿Seguro que deseas eliminar este curso?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/Cursos/${id}`);

      toast.success(
        "Curso eliminado exitosamente."
      );

      await cargarDatos();

    } catch (error: any) {
      toast.error(
        error.response?.data ??
          "No se pudo eliminar. Puede tener estudiantes inscritos."
      );
    }
  };

  return (
    <div>
      <h1>Cursos</h1>

      <form
        onSubmit={guardar}
        className="form-card"
      >

        {/* CENTRO */}
        {esAdministrador && (
          <select
            value={centroId}
            onChange={(e) =>
              setCentroId(e.target.value)
            }
            required
          >
            <option value="">
              Seleccione centro
            </option>

            {centros.map((centro) => (
              <option
                key={centro.id}
                value={centro.id}
              >
                {centro.nombre}
              </option>
            ))}
          </select>
        )}

        {/* GRADO */}
        <select
          value={idGrado}
          onChange={(e) =>
            setIdGrado(e.target.value)
          }
          required
        >
          <option value="">
            Seleccione grado
          </option>

          {grados.map((grado) => (
            <option
              key={grado.idGrado}
              value={grado.idGrado}
            >
              {grado.nivel} - {grado.nombre}
            </option>
          ))}
        </select>

        {/* NOMBRE */}
        <input
          placeholder="Nombre del curso"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          required
        />

        {/* SECCIÓN */}
        <input
          placeholder="Sección"
          value={seccion}
          onChange={(e) =>
            setSeccion(e.target.value)
          }
        />

        <button type="submit">
          {editandoId
            ? "Actualizar"
            : "Crear"}

            
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
            <th>Centro</th>
            <th>Nivel</th>
            <th>Grado</th>
            <th>Curso</th>
            <th>Sección</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cursos.map((curso) => (
            <tr key={curso.idCurso}>
              <td>
                {curso.idCurso}
              </td>

              <td>
                {curso.centro ??
                  "Sin centro"}
              </td>

              <td>
                {curso.nivel}
              </td>

              <td>
                {curso.grado}
              </td>

              <td>
                {curso.nombre}
              </td>

              <td>
                {curso.seccion}
              </td>

              <td>
                {curso.activo
                  ? "Activo"
                  : "Inactivo"}
              </td>

              <td>
                <button
                  onClick={() =>
                    editar(curso)
                  }
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    cambiarEstado(
                      curso.idCurso
                    )
                  }
                >
                  {curso.activo
                    ? "Desactivar"
                    : "Activar"}
                </button>

                <button
                  onClick={() =>
                    eliminar(
                      curso.idCurso
                    )
                  }
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CursosPage;