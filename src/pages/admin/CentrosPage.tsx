import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

interface Centro {
  id: number;
  nombre: string;
  codigo?: string | null;
  estado: boolean;
}

const CentrosPage = () => {
  const [centros, setCentros] = useState<Centro[]>([]);

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarCentros = async () => {
    const res = await api.get("/Centros");
    setCentros(res.data);
  };

  useEffect(() => {
    cargarCentros();
  }, []);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setCodigo("");
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nombre,
      codigo: codigo.trim() === "" ? null : codigo.trim(),
    };

    try {
      if (editandoId) {
        await api.put(`/Centros/${editandoId}`, payload);
      } else {
        await api.post("/Centros", payload);
      }

      limpiarFormulario();
      cargarCentros();
      toast.success(`Centro ${editandoId ? "actualizado" : "creado"} exitosamente.`);
    } catch {
      toast.error("Ocurrió un error al guardar el centro.");
    }
  };

  const editar = (centro: Centro) => {
    setEditandoId(centro.id);
    setNombre(centro.nombre);
    setCodigo(centro.codigo ?? "");
  };

  const cambiarEstado = async (centro: Centro) => {
    try {
      await api.put(`/Centros/${centro.id}/estado`);
      cargarCentros();
      toast.success(
        `Centro ${centro.estado ? "desactivado" : "activado"} exitosamente.`
      );
    } catch {
      toast.error("No se pudo cambiar el estado del centro.");
    }
  };

  return (
    <div>
      <h1>Centros / Recintos</h1>

      <form onSubmit={guardar} className="form-card">
        <input
          placeholder="Nombre del centro"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          placeholder="Código (opcional)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <button type="submit">{editandoId ? "Actualizar" : "Crear"}</button>

        {editandoId && (
          <button type="button" onClick={limpiarFormulario}>
            Cancelar
          </button>
        )}
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Código</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {centros.map((centro) => (
            <tr key={centro.id}>
              <td>{centro.id}</td>
              <td>{centro.nombre}</td>
              <td>{centro.codigo || "—"}</td>
              <td>{centro.estado ? "Activo" : "Inactivo"}</td>
              <td>
                <button onClick={() => editar(centro)}>Editar</button>
                <button onClick={() => cambiarEstado(centro)}>
                  {centro.estado ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}

          {centros.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center" }}>
                No hay centros registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CentrosPage;
