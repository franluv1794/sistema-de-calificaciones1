import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

interface Maestro {
  idMaestro: number;
  centroId: number | null;
  centro: string | null;
  codigoEmpleado: string | null;
  nombres: string;
  apellidos: string;
  cedula: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  especialidad: string | null;
  fechaIngreso: string | null;
  activo: boolean;
  usuario: string | null;
}

const MaestrosPage = () => {
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [importando, setImportando] = useState(false);

  const cargarMaestros = async () => {
    try {
      const res = await api.get("/Maestros");
      setMaestros(res.data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los maestros.");
    }
  };

  useEffect(() => {
    cargarMaestros();
  }, []);

  const importarExcel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivo) {
      alert("Selecciona un archivo Excel.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    setImportando(true);
    setResultado(null);

    try {
      const res = await api.post(
        "/ImportacionExcel/maestros",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResultado(res.data);
      setArchivo(null);

      await cargarMaestros();

    } catch (error: any) {
      console.error("Error importando maestros:", error);

      setResultado({
        total: 0,
        exitosos: 0,
        fallidos: 1,
        errores: [
          {
            fila: "-",
            error:
              error.response?.data ??
              "No se pudo importar el archivo.",
          },
        ],
      });

    } finally {
      setImportando(false);
    }
  };

  const cambiarEstado = async (id: number) => {
    try {
      await api.put(`/Maestros/${id}/estado`);
      await cargarMaestros();
    } catch (error: any) {
      alert(
        error.response?.data ??
          "No se pudo cambiar el estado del maestro."
      );
    }
  };

  return (
    <div>
      <h1>Maestros</h1>

      {/* =========================
          IMPORTAR EXCEL
      ========================= */}

      <form
        onSubmit={importarExcel}
        className="form-card"
        style={{ marginBottom: 20 }}
      >
        <h3>Importar maestros</h3>

        <p>
          Selecciona un archivo Excel con los maestros.
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) =>
            setArchivo(
              e.target.files?.[0] ?? null
            )
          }
          required
        />

        <button
          type="submit"
          disabled={importando}
        >
          {importando
            ? "Importando..."
            : "Importar maestros"}
        </button>
      </form>

      {/* =========================
          RESULTADO IMPORTACIÓN
      ========================= */}

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
            <>
              <h4>Errores</h4>

              <ul>
                {resultado.errores.map(
                  (err: any, index: number) => (
                    <li key={index}>
                      Fila {err.fila}:{" "}
                      {err.error}
                    </li>
                  )
                )}
              </ul>
            </>
          )}
        </div>
      )}

      {/* =========================
          TABLA
      ========================= */}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Maestro</th>
            <th>Centro</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Especialidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {maestros.map((m) => (
            <tr key={m.idMaestro}>
              <td>
                {m.idMaestro}
              </td>

              <td>
                {m.usuario}
              </td>

              <td>
                {m.nombres} {m.apellidos}
              </td>

              <td>
                {m.centro ?? "Sin centro"}
              </td>

              <td>
                {m.telefono}
              </td>

              <td>
                {m.correo}
              </td>

              <td>
                {m.especialidad}
              </td>

              <td>
                {m.activo
                  ? "Activo"
                  : "Inactivo"}
              </td>

              <td>
                <button
                  onClick={() =>
                    cambiarEstado(
                      m.idMaestro
                    )
                  }
                >
                  {m.activo
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

export default MaestrosPage;