import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaKey,
  FaPowerOff,
  FaUsersCog,
  FaBuilding,
  FaGraduationCap,
  FaTimes,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

import api from "../../api/axiosConfig";
import "../../Styles/CoordinadoresAdmin.css";

interface Coordinador {
  idUsuario: number;
  nombreUsuario: string;
  rol: string;
  centroId: number | null;
  centro: string;
  activo: boolean;
}

interface Centro {
  id: number;
  nombre: string;
  codigo?: string;
  estado: boolean;
}

interface Rol {
  idRol: number;
  nombre: string;
}

interface FormularioCoordinador {
  nombres: string;
  apellidos: string;
  idRol: string;
  centroId: string;
}

const CoordinadoresAdmin = () => {
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCentro, setFiltroCentro] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);

  const [coordinadorSeleccionado, setCoordinadorSeleccionado] =
    useState<Coordinador | null>(null);

  const [passwordTemporal, setPasswordTemporal] = useState("");
  const [copiado, setCopiado] = useState(false);

  const [cargando, setCargando] = useState(false);

  const [formulario, setFormulario] =
    useState<FormularioCoordinador>({
      nombres: "",
      apellidos: "",
      idRol: "",
      centroId: "",
    });

  /* =====================================================
     CARGAR DATOS
  ===================================================== */

  const cargarCoordinadores = async () => {
    try {
      const res = await api.get("/Coordinadores");
      setCoordinadores(res.data);
    } catch (error) {
      console.error("Error cargando coordinadores:", error);
      alert("No se pudieron cargar los coordinadores.");
    }
  };

  const cargarCentros = async () => {
    try {
      const res = await api.get("/Centros");
      setCentros(res.data);
    } catch (error) {
      console.error("Error cargando centros:", error);
    }
  };

  const cargarRoles = async () => {
    try {
      const res = await api.get("/Roles");

      const rolesCoordinacion = res.data.filter(
        (rol: Rol) => rol.nombre.startsWith("Coordinador")
      );

      setRoles(rolesCoordinacion);
    } catch (error) {
      console.error("Error cargando roles:", error);
    }
  };

  useEffect(() => {
    cargarCoordinadores();
    cargarCentros();
    cargarRoles();
  }, []);

  /* =====================================================
     FILTROS
  ===================================================== */

  const coordinadoresFiltrados = useMemo(() => {
    return coordinadores.filter((coordinador) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        coordinador.nombreUsuario
          .toLowerCase()
          .includes(texto) ||
        coordinador.rol
          .toLowerCase()
          .includes(texto) ||
        coordinador.centro
          .toLowerCase()
          .includes(texto);

      const coincideCentro =
        !filtroCentro ||
        String(coordinador.centroId) === filtroCentro;

      const coincideRol =
        !filtroRol ||
        coordinador.rol === filtroRol;

      return (
        coincideBusqueda &&
        coincideCentro &&
        coincideRol
      );
    });
  }, [
    coordinadores,
    busqueda,
    filtroCentro,
    filtroRol,
  ]);

  const rolesCoordinacion = [
  {
    idRol: 5,
    nombre: "CoordinadorPrimaria",
  },
  {
    idRol: 6,
    nombre: "CoordinadorSecundaria",
  },
  {
    idRol: 7,
    nombre: "CoordinadorPolitecnico",
  },
];

  const rolesDisponibles = useMemo(() => {
  return Array.from(
    new Set(
      coordinadores
        .map((c) => c.rol)
        .filter(Boolean)
    )
  );
}, [coordinadores]);
const centrosDisponibles = useMemo(() => {
  const mapa = new Map<number, string>();

  coordinadores.forEach((c) => {
    if (c.centroId && c.centro) {
      mapa.set(c.centroId, c.centro);
    }
  });

  return Array.from(mapa.entries()).map(([id, nombre]) => ({
    id,
    nombre,
  }));
}, [coordinadores]);

  /* =====================================================
     CREAR
  ===================================================== */

  const crearCoordinador = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !formulario.nombres.trim() ||
      !formulario.apellidos.trim() ||
      !formulario.idRol ||
      !formulario.centroId
    ) {
      alert("Completa todos los campos.");
      return;
    }

    setCargando(true);

    try {
      const res = await api.post(
        "/Coordinadores",
        {
          nombres: formulario.nombres,
          apellidos: formulario.apellidos,
          idRol: Number(formulario.idRol),
          centroId: Number(formulario.centroId),
        }
      );

      setPasswordTemporal(
        res.data.password
      );

      setMostrarModal(false);

      setFormulario({
        nombres: "",
        apellidos: "",
        idRol: "",
        centroId: "",
      });



      await cargarCoordinadores();

    } catch (error: any) {
      alert(
        error.response?.data ??
          "No se pudo crear el coordinador."
      );
    } finally {
      setCargando(false);
    }
  };

  /* =====================================================
     EDITAR
  ===================================================== */

  const abrirEditar = (
    coordinador: Coordinador
  ) => {
    setCoordinadorSeleccionado(
      coordinador
    );

    setFormulario({
      nombres: "",
      apellidos: "",
      idRol:
        roles.find(
          (r) =>
            r.nombre === coordinador.rol
        )?.idRol.toString() ?? "",
      centroId:
        coordinador.centroId?.toString() ?? "",
    });

    setMostrarEditar(true);
  };

  const editarCoordinador = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!coordinadorSeleccionado) return;

    try {
      await api.put(
        `/Coordinadores/${coordinadorSeleccionado.idUsuario}`,
        {
          idRol: Number(formulario.idRol),
          idCentro: Number(formulario.centroId),
          activo: coordinadorSeleccionado.activo,
        }
      );

      setMostrarEditar(false);
      setCoordinadorSeleccionado(null);

      await cargarCoordinadores();

    } catch (error: any) {
      alert(
        error.response?.data ??
          "No se pudo actualizar el coordinador."
      );
    }
  };

  /* =====================================================
     ACTIVAR / DESACTIVAR
  ===================================================== */

  const cambiarEstado = async (
    coordinador: Coordinador
  ) => {
    const accion = coordinador.activo
      ? "desactivar"
      : "activar";

    if (
      !confirm(
        `¿Seguro que deseas ${accion} este coordinador?`
      )
    ) {
      return;
    }

    try {
      await api.put(
        `/Coordinadores/${coordinador.idUsuario}/estado`
      );

      await cargarCoordinadores();

    } catch (error: any) {
      alert(
        error.response?.data ??
          "No se pudo cambiar el estado."
      );
    }
  };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const resetPassword = async (
    coordinador: Coordinador
  ) => {
    if (
      !confirm(
        `¿Restablecer la contraseña de ${coordinador.nombreUsuario}?`
      )
    ) {
      return;
    }

    try {
      const res = await api.put(
        `/Coordinadores/${coordinador.idUsuario}/reset`
      );

      setPasswordTemporal(
        res.data.passwordTemporal
      );

    } catch (error: any) {
      alert(
        error.response?.data ??
          "No se pudo restablecer la contraseña."
      );
    }
  };

  /* =====================================================
     COPIAR PASSWORD
  ===================================================== */

  const copiarPassword = async () => {
    await navigator.clipboard.writeText(
      passwordTemporal
    );

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="coordinadores-page">

      {/* HEADER */}

      <div className="coord-header">

        <div>
          <span className="coord-eyebrow">
            ADMINISTRACIÓN
          </span>

          <h1>
            Coordinadores
          </h1>

          <p>
            Gestiona los coordinadores responsables
            de cada centro educativo.
          </p>
        </div>

        <button
          className="coord-primary-btn"
          onClick={() => {
            setFormulario({
              nombres: "",
              apellidos: "",
              idRol: "",
              centroId: "",
            });

            setMostrarModal(true);
          }}
        >
          <FaPlus />
          Nuevo coordinador
        </button>

      </div>


      {/* RESUMEN */}

      <div className="coord-summary">

        <div>
          <FaUsersCog />
          <div>
            <span>Total coordinadores</span>
            <strong>
              {coordinadores.length}
            </strong>
          </div>
        </div>

        <div>
          <FaBuilding />
          <div>
            <span>Centros</span>
            <strong>
              {centros.length}
            </strong>
          </div>
        </div>

        <div>
          <FaGraduationCap />
          <div>
            <span>Activos</span>
            <strong>
              {
                coordinadores.filter(
                  (c) => c.activo
                ).length
              }
            </strong>
          </div>
        </div>

      </div>


      {/* TABLA */}

      <section className="coord-table-card">

        <div className="coord-table-header">

          <div>
            <h2>
              Coordinadores registrados
            </h2>

            <p>
              Administra los accesos y centros asignados.
            </p>
          </div>

        </div>


        {/* FILTROS */}

        <div className="coord-filters">

          <div className="coord-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Buscar coordinador..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />
          </div>


    <select
  value={filtroCentro}
  onChange={(e) => setFiltroCentro(e.target.value)}
>
  <option value="">
    Todos los centros
  </option>

  {centrosDisponibles.map((centro) => (
    <option
      key={centro.id}
      value={centro.id}
    >
      {centro.nombre}
    </option>
  ))}
</select>

<select
  value={filtroRol}
  onChange={(e) => setFiltroRol(e.target.value)}
>
  <option value="">
    Todos los roles
  </option>

  {rolesDisponibles.map((rol) => (
    <option
      key={rol}
      value={rol}
    >
      {rol.replace(
        "Coordinador",
        "Coordinador "
      )}
    </option>
  ))}
</select>

        </div>


        {/* TABLA */}

        <div className="coord-table-wrapper">

          <table className="coord-table">

            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Centro educativo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {coordinadoresFiltrados.length ===
              0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="coord-empty"
                  >
                    <FaUsersCog />

                    <strong>
                      No hay coordinadores
                    </strong>

                    <span>
                      No se encontraron resultados
                      con los filtros actuales.
                    </span>
                  </td>
                </tr>

              ) : (

                coordinadoresFiltrados.map(
                  (coordinador) => (

                    <tr
                      key={
                        coordinador.idUsuario
                      }
                    >

                      <td>

                        <div className="coord-user">

                          <div className="coord-avatar">
                            {coordinador.nombreUsuario
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                coordinador.nombreUsuario
                              }
                            </strong>

                            <span>
                              ID #{coordinador.idUsuario}
                            </span>
                          </div>

                        </div>

                      </td>


                      <td>
                        <span className="coord-role">
                          {coordinador.rol
                            .replace(
                              "Coordinador",
                              "Coordinador "
                            )}
                        </span>
                      </td>


                      <td>

                        <div className="coord-center">

                          <FaBuilding />

                          <span>
                            {coordinador.centro}
                          </span>

                        </div>

                      </td>


                      <td>

                        <span
                          className={
                            coordinador.activo
                              ? "coord-status active"
                              : "coord-status inactive"
                          }
                        >
                          <span />
                          {coordinador.activo
                            ? "Activo"
                            : "Inactivo"}
                        </span>

                      </td>


                      <td>

                        <div className="coord-actions">

                          <button
                            title="Editar"
                            onClick={() =>
                              abrirEditar(
                                coordinador
                              )
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            title="Restablecer contraseña"
                            onClick={() =>
                              resetPassword(
                                coordinador
                              )
                            }
                          >
                            <FaKey />
                          </button>

                          <button
                            title={
                              coordinador.activo
                                ? "Desactivar"
                                : "Activar"
                            }
                            className={
                              coordinador.activo
                                ? "danger"
                                : "success"
                            }
                            onClick={() =>
                              cambiarEstado(
                                coordinador
                              )
                            }
                          >
                            <FaPowerOff />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =================================================
          MODAL CREAR
      ================================================= */}

      {mostrarModal && (

        <div className="coord-modal-overlay">

          <div className="coord-modal">

            <div className="coord-modal-header">

              <div>
                <span>
                  NUEVO USUARIO
                </span>

                <h2>
                  Crear coordinador
                </h2>
              </div>

              <button
                onClick={() =>
                  setMostrarModal(false)
                }
              >
                <FaTimes />
              </button>

            </div>


            <form
              onSubmit={crearCoordinador}
              className="coord-form"
            >

              <div className="coord-form-grid">

                <label>
                  Nombres

                  <input
                    value={formulario.nombres}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        nombres:
                          e.target.value,
                      })
                    }
                    required
                  />
                </label>


                <label>
                  Apellidos

                  <input
                    value={formulario.apellidos}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        apellidos:
                          e.target.value,
                      })
                    }
                    required
                  />
                </label>

              </div>
<label>
  Rol de coordinación

  <select
    value={formulario.idRol}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        idRol: e.target.value,
      })
    }
    required
  >
    <option value="">
      Seleccione un rol
    </option>

    {rolesCoordinacion.map((rol) => (
      <option
        key={rol.idRol}
        value={String(rol.idRol)}
      >
        {rol.nombre.replace(
          "Coordinador",
          "Coordinador "
        )}
      </option>
    ))}
  </select>

  <small>
    Valor actual: {formulario.idRol}
  </small>
</label>

          
<label>
  Centro educativo

  <select
    value={formulario.centroId}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        centroId: e.target.value,
      })
    }
    required
  >
    <option value="">
      Seleccione un centro
    </option>

    {centrosDisponibles.map((centro) => (
      <option
        key={centro.id}
        value={centro.id}
      >
        {centro.nombre}
      </option>
    ))}
  </select>
</label>
              


              <div className="coord-form-info">
                <FaKey />

                <span>
                  El sistema generará automáticamente
                  el usuario y una contraseña temporal.
                </span>
              </div>


              <div className="coord-modal-actions">

                <button
                  type="button"
                  className="coord-cancel-btn"
                  onClick={() =>
                    setMostrarModal(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="coord-primary-btn"
                  disabled={cargando}
                >
                  {cargando
                    ? "Creando..."
                    : "Crear coordinador"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          MODAL EDITAR
      ================================================= */}

      {mostrarEditar &&
        coordinadorSeleccionado && (

          <div className="coord-modal-overlay">

            <div className="coord-modal">

              <div className="coord-modal-header">

                <div>
                  <span>
                    CONFIGURACIÓN
                  </span>

                  <h2>
                    Editar coordinador
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setMostrarEditar(false)
                  }
                >
                  <FaTimes />
                </button>

              </div>


              <form
                onSubmit={editarCoordinador}
                className="coord-form"
              >

                <div className="coord-edit-user">

                  <div className="coord-avatar">
                    {coordinadorSeleccionado.nombreUsuario
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {
                        coordinadorSeleccionado.nombreUsuario
                      }
                    </strong>

                    <span>
                      Puedes modificar su rol y centro.
                    </span>
                  </div>

                </div>


                <label>
                  Rol de coordinación

                  <select
                    value={formulario.idRol}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        idRol:
                          e.target.value,
                      })
                    }
                    required
                  >

                    {roles.map((rol) => (
                      <option
                        key={rol.idRol}
                        value={rol.idRol}
                      >
                        {rol.nombre.replace(
                          "Coordinador",
                          "Coordinador "
                        )}
                      </option>
                    ))}

                  </select>

                </label>


                <label>
                  Centro educativo

                  <select
                    value={formulario.centroId}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        centroId:
                          e.target.value,
                      })
                    }
                    required
                  >

                    {centros
                      .filter(
                        (c) => c.estado
                      )
                      .map((centro) => (
                        <option
                          key={centro.id}
                          value={centro.id}
                        >
                          {centro.nombre}
                        </option>
                      ))}

                  </select>

                </label>


                <div className="coord-modal-actions">

                  <button
                    type="button"
                    className="coord-cancel-btn"
                    onClick={() =>
                      setMostrarEditar(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="coord-primary-btn"
                  >
                    Guardar cambios
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}


      {/* =================================================
          PASSWORD
      ================================================= */}

      {passwordTemporal && (

        <div className="coord-modal-overlay">

          <div className="coord-password-modal">

            <div className="coord-password-icon">
              <FaKey />
            </div>

            <span className="coord-eyebrow">
              CREDENCIAL TEMPORAL
            </span>

            <h2>
              Contraseña generada
            </h2>

            <p>
              Guarda esta contraseña. El coordinador
              deberá cambiarla al iniciar sesión.
            </p>


            <div className="coord-password-box">

              <strong>
                {passwordTemporal}
              </strong>

              <button
                onClick={copiarPassword}
                title="Copiar contraseña"
              >
                {copiado ? (
                  <FaCheck />
                ) : (
                  <FaCopy />
                )}
              </button>

            </div>


            <button
              className="coord-primary-btn coord-password-close"
              onClick={() =>
                setPasswordTemporal("")
              }
            >
              Entendido
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default CoordinadoresAdmin;