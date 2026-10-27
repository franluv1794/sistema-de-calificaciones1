import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { confirmar, mensajeError } from "../../Componentes/Notificaciones/Notificaciones";
  
interface AnioEscolar {
  idAnioEscolar: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  cerrado: boolean;
}

const AniosEscolaresPage = () => {
  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarAnios = async () => {
    try {
      const res = await api.get("/AniosEscolares");
      setAnios(res.data);
    } catch (error) {
      toast.error(mensajeError(error, "No se pudieron cargar los años escolares."));
    }
  };

  useEffect(() => {
    cargarAnios();
  }, []);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/AniosEscolares", {
        nombre,
        fechaInicio,
        fechaFin,
      });

      toast.success("Año escolar creado correctamente.");
      setNombre("");
      setFechaInicio("");
      setFechaFin("");
      cargarAnios();
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo crear el año escolar."));
    }
  };

  const activar = async (id: number) => {
    try {
      await api.put(`/AniosEscolares/${id}/activar`);
      toast.success("Año escolar activado.");
      cargarAnios();
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo activar el año escolar."));
    }
  };

  const cerrar = async (id: number) => {
    if (!(await confirmar({
      titulo: "Cerrar año escolar",
      mensaje: "¿Seguro que deseas cerrar este año escolar? Esta acción afectará los períodos y calificaciones asociados.",
      textoConfirmar: "Sí, cerrar",
      tipo: "advertencia",
    }))) return;

    try {
      await api.put(`/AniosEscolares/${id}/cerrar`);
      toast.success("Año escolar cerrado.");
      cargarAnios();
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo cerrar el año escolar."));
    }
  };

  return (
    <div>
      <h1>Años Escolares</h1>

      <form onSubmit={guardar} className="form-card">
        <input
          placeholder="Ej: 2026-2027"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          required
        />

        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          required
        />

        <button type="submit">Crear</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Año Escolar</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Activo</th>
            <th>Cerrado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {anios.map((anio) => (
            <tr key={anio.idAnioEscolar}>
              <td>{anio.idAnioEscolar}</td>
              <td>{anio.nombre}</td>
              <td>{anio.fechaInicio?.substring(0, 10)}</td>
              <td>{anio.fechaFin?.substring(0, 10)}</td>
              <td>{anio.activo ? "Sí" : "No"}</td>
              <td>{anio.cerrado ? "Sí" : "No"}</td>
              <td>
                {!anio.activo && !anio.cerrado && (
                  <button onClick={() => activar(anio.idAnioEscolar)}>
                    Activar
                  </button>
                )}

                {!anio.cerrado && (
                  <button onClick={() => cerrar(anio.idAnioEscolar)}>
                    Cerrar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AniosEscolaresPage;