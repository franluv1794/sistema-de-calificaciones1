import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import FiltrosBusqueda from "../../Componentes/FiltrosBusqueda/FiltrosBusqueda";
import Paginacion from "../../Componentes/Paginacion/Paginacion";
import { usePaginado } from "../../Componentes/Paginacion/usePaginado";

interface Padre {
  idPadre: number;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  ocupacion: string | null;
  activo: boolean;
  usuario: string | null;
  cantidadHijos: number;
}

interface Hijo {
  idEstudiante: number;
  matricula: string;
  nombres: string;
  apellidos: string;
  parentesco: string;
  cursoActual: string | null;
}

const PadresPage = () => {
  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [padreSeleccionado, setPadreSeleccionado] = useState<Padre | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const listado = usePaginado<Padre>("/Padres/paginado", {
    busqueda: busqueda.trim(),
    estado: filtroEstado,
  });
  const padres = listado.items;
  const cargarPadres = listado.recargar;

  useEffect(() => {
    if (listado.error) {
      console.error(listado.error);
      toast.error("No se pudieron cargar los padres.");
    }
  }, [listado.error]);

  const verHijos = async (padre: Padre) => {
    setPadreSeleccionado(padre);
    const res = await api.get(`/Padres/${padre.idPadre}/hijos`);
    setHijos(res.data);
  };

  const cambiarEstado = async (id: number) => {
    await api.put(`/Padres/${id}/estado`);
    cargarPadres();
  };

  return (
    <div>
      <h1>Padres</h1>

      {padreSeleccionado && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>
            Hijos de {padreSeleccionado.nombres} {padreSeleccionado.apellidos}
          </h3>

          {hijos.length === 0 ? (
            <p>No tiene hijos asociados.</p>
          ) : (
            <ul>
              {hijos.map((hijo) => (
                <li key={hijo.idEstudiante}>
                  {hijo.nombres} {hijo.apellidos} - {hijo.cursoActual} -{" "}
                  {hijo.parentesco}
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setPadreSeleccionado(null)}>Cerrar</button>
        </div>
      )}

      <FiltrosBusqueda
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        placeholder="Buscar por nombre, teléfono o correo..."
        onLimpiar={() => {
          setBusqueda("");
          setFiltroEstado("");
        }}
        filtros={[
          {
            clave: "estado",
            etiqueta: "Estado",
            valor: filtroEstado,
            opciones: ["Activo", "Inactivo"],
            onChange: setFiltroEstado,
          },
        ]}
      />

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Padre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Hijos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {padres.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
                {listado.cargando
                  ? "Cargando padres..."
                  : "No hay padres que coincidan."}
              </td>
            </tr>
          )}

          {padres.map((p) => (
            <tr key={p.idPadre}>
              <td>{p.idPadre}</td>
              <td>{p.usuario}</td>
              <td>
                {p.nombres} {p.apellidos}
              </td>
              <td>{p.telefono}</td>
              <td>{p.correo}</td>
              <td>
                <button onClick={() => verHijos(p)}>
                  {p.cantidadHijos} hijos
                </button>
              </td>
              <td>{p.activo ? "Activo" : "Inactivo"}</td>
              <td>
                <button onClick={() => cambiarEstado(p.idPadre)}>
                  {p.activo ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default PadresPage;