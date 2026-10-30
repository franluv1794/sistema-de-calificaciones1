import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { confirmar, mensajeError } from "../../Componentes/Notificaciones/Notificaciones";
import FiltrosBusqueda, {
  opcionesUnicas,
} from "../../Componentes/FiltrosBusqueda/FiltrosBusqueda";
import Paginacion from "../../Componentes/Paginacion/Paginacion";
import { usePaginado } from "../../Componentes/Paginacion/usePaginado";

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
  niveles: string[];
}

interface OpcionesFiltros {
  datos: { centro: string | null; especialidad: string | null }[];
  asignaciones: {
    centro: string | null;
    nivel: string;
    curso: string;
    materia: string;
  }[];
}

interface Credencial {
  nombre: string;
  usuario: string;
  password: string;
}

// La API puede enviar los campos con distintos nombres
const leerCredenciales = (data: any): Credencial[] =>
  (data?.credenciales ?? data?.Credenciales ?? []).map((c: any) => ({
    nombre: c.nombre ?? c.Nombre ?? c.nombreCompleto ?? c.NombreCompleto ?? "",
    usuario: c.usuario ?? c.Usuario ?? c.nombreUsuario ?? c.NombreUsuario ?? "",
    password:
      c.passwordTemporal ?? c.PasswordTemporal ??
      c.password ?? c.Password ??
      c.contrasena ?? c.Contrasena ?? "",
  }));

const descargarCredenciales = (credenciales: Credencial[]) => {
  const escapar = (valor: string) => `"${String(valor).replace(/"/g, '""')}"`;
  const filas = [
    ["Nombre", "Usuario", "Contraseña temporal"],
    ...credenciales.map((c) => [c.nombre, c.usuario, c.password]),
  ];

  // BOM para que Excel abra bien los acentos
  const csv = "﻿" + filas.map((f) => f.map(escapar).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `credenciales-maestros-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
};

const MaestrosPage = () => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [importando, setImportando] = useState(false);
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [opciones, setOpciones] = useState<OpcionesFiltros>({
    datos: [],
    asignaciones: [],
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtroCentro, setFiltroCentro] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [descargadas, setDescargadas] = useState(false);

  const listado = usePaginado<Maestro>("/Maestros/paginado", {
    busqueda: busqueda.trim(),
    centro: filtroCentro,
    nivel: filtroNivel,
    curso: filtroCurso,
    materia: filtroMateria,
    especialidad: filtroEspecialidad,
    estado: filtroEstado,
  });
  const maestros = listado.items;

  useEffect(() => {
    if (listado.error) {
      console.error(listado.error);
      toast.error("No se pudieron cargar los maestros.");
    }
  }, [listado.error]);

  const cargarOpciones = async () => {
    try {
      const res = await api.get("/Maestros/filtros");
      setOpciones(res.data);
    } catch (error) {
      // Sin opciones, la página sigue funcionando sin esos filtros
      console.error("No se pudieron cargar las opciones de filtros:", error);
    }
  };

  useEffect(() => {
    cargarOpciones();
  }, []);

  const cargarMaestros = async () => {
    await Promise.all([listado.recargar(), cargarOpciones()]);
  };

  // Cada filtro solo ofrece opciones que existen con los filtros anteriores
  const datosPorCentro = useMemo(
    () => opciones.datos.filter((d) => !filtroCentro || d.centro === filtroCentro),
    [opciones, filtroCentro]
  );
  const asignacionesPorCentro = useMemo(
    () => opciones.asignaciones.filter((a) => !filtroCentro || a.centro === filtroCentro),
    [opciones, filtroCentro]
  );
  const asignacionesPorNivel = useMemo(
    () => asignacionesPorCentro.filter((a) => !filtroNivel || a.nivel === filtroNivel),
    [asignacionesPorCentro, filtroNivel]
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroCentro("");
    setFiltroNivel("");
    setFiltroCurso("");
    setFiltroMateria("");
    setFiltroEspecialidad("");
    setFiltroEstado("");
  };

  const importarExcel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivo) {
      toast.warning("Selecciona un archivo Excel.");
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
      setCredenciales(leerCredenciales(res.data));
      setDescargadas(false);
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

  const copiarCredenciales = async () => {
    const texto = credenciales
      .map((c) => `${c.nombre}\tUsuario: ${c.usuario}\tContraseña: ${c.password}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(texto);
      setDescargadas(true);
      toast.success("Credenciales copiadas.");
    } catch {
      toast.error("No se pudieron copiar. Usa la descarga.");
    }
  };

  const cerrarCredenciales = async () => {
    if (
      !descargadas &&
      !(await confirmar({
        titulo: "¿Cerrar sin guardar?",
        mensaje:
          "Estas contraseñas no se vuelven a mostrar. Si cierras sin descargarlas o copiarlas, tendrás que restablecer la contraseña de cada maestro.",
        textoConfirmar: "Cerrar de todos modos",
        tipo: "peligro",
      }))
    ) {
      return;
    }

    setCredenciales([]);
  };

  const cambiarEstado = async (id: number) => {
    try {
      await api.put(`/Maestros/${id}/estado`);
      await cargarMaestros();
    } catch (error: any) {
      toast.error(
        mensajeError(error, "No se pudo cambiar el estado del maestro.")
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
          CREDENCIALES GENERADAS
      ========================= */}

      {credenciales.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            border: "2px solid #e09b12",
            background: "#fffaf0",
          }}
        >
          <h3>Contraseñas temporales de los maestros creados</h3>

          <p>
            <strong>Guarda esta lista ahora: no se vuelve a mostrar.</strong>{" "}
            Entrega a cada maestro su usuario y contraseña. Al entrar por
            primera vez, el sistema le pedirá crear una contraseña nueva.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0" }}>
            <button
              type="button"
              onClick={() => {
                descargarCredenciales(credenciales);
                setDescargadas(true);
              }}
            >
              Descargar lista (Excel / CSV)
            </button>

            <button type="button" onClick={copiarCredenciales}>
              Copiar todo
            </button>

            <button type="button" onClick={cerrarCredenciales}>
              Cerrar
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Maestro</th>
                  <th>Usuario</th>
                  <th>Contraseña temporal</th>
                </tr>
              </thead>

              <tbody>
                {credenciales.map((c, index) => (
                  <tr key={`${c.usuario}-${index}`}>
                    <td>{c.nombre}</td>
                    <td>{c.usuario}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 15 }}>
                      {c.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================
          FILTROS
      ========================= */}

      <FiltrosBusqueda
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        placeholder="Buscar por nombre, usuario, cédula o código..."
        onLimpiar={limpiarFiltros}
        filtros={[
          {
            clave: "centro",
            etiqueta: "Centro",
            valor: filtroCentro,
            opciones: opcionesUnicas(opciones.datos.map((d) => d.centro)),
            onChange: (v) => {
              setFiltroCentro(v);
              setFiltroNivel("");
              setFiltroCurso("");
              setFiltroMateria("");
            },
          },
          {
            clave: "nivel",
            etiqueta: "Nivel",
            valor: filtroNivel,
            opciones: opcionesUnicas(asignacionesPorCentro.map((a) => a.nivel)),
            onChange: (v) => {
              setFiltroNivel(v);
              setFiltroCurso("");
              setFiltroMateria("");
            },
          },
          {
            clave: "curso",
            etiqueta: "Curso",
            valor: filtroCurso,
            opciones: opcionesUnicas(asignacionesPorNivel.map((a) => a.curso)),
            onChange: setFiltroCurso,
          },
          {
            clave: "materia",
            etiqueta: "Materia",
            valor: filtroMateria,
            opciones: opcionesUnicas(asignacionesPorNivel.map((a) => a.materia)),
            onChange: setFiltroMateria,
          },
          {
            clave: "especialidad",
            etiqueta: "Especialidad",
            valor: filtroEspecialidad,
            opciones: opcionesUnicas(datosPorCentro.map((d) => d.especialidad)),
            onChange: setFiltroEspecialidad,
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

      {/* =========================
          TABLA
      ========================= */}

      <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Maestro</th>
            <th>Centro</th>
            <th>Nivel</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Especialidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {maestros.length === 0 && (
            <tr>
              <td colSpan={10} style={{ textAlign: "center" }}>
                {listado.cargando
                  ? "Cargando maestros..."
                  : "No hay maestros que coincidan."}
              </td>
            </tr>
          )}

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
                {opcionesUnicas(m.niveles ?? []).join(", ") || "—"}
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

export default MaestrosPage;