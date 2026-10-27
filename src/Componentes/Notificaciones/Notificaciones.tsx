import { useEffect, useRef, useState } from "react";
import { ToastContainer, Slide } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  XCircle,
  X,
} from "lucide-react";
import "../../Styles/Notificaciones.css";

export type TipoConfirmacion = "peligro" | "advertencia" | "info" | "exito";

export interface OpcionesConfirmacion {
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: TipoConfirmacion;
}

interface SolicitudConfirmacion extends OpcionesConfirmacion {
  resolver: (valor: boolean) => void;
}

let mostrarDialogo: ((solicitud: SolicitudConfirmacion) => void) | null = null;

/**
 * Muestra el diálogo de confirmación del sistema.
 * Uso: if (!(await confirmar({ mensaje: "¿Seguro?" }))) return;
 */
export const confirmar = (
  opciones: OpcionesConfirmacion | string
): Promise<boolean> => {
  const datos =
    typeof opciones === "string" ? { mensaje: opciones } : opciones;

  return new Promise((resolver) => {
    if (!mostrarDialogo) {
      resolver(window.confirm(datos.mensaje));
      return;
    }

    mostrarDialogo({ ...datos, resolver });
  });
};

/**
 * Extrae un texto legible de un error de axios para mostrarlo al usuario.
 */
export const mensajeError = (error: any, porDefecto: string): string => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data?.mensaje) return String(data.mensaje);
  if (data?.message) return String(data.message);
  if (data?.title) return String(data.title);

  return porDefecto;
};

const iconos = {
  peligro: Trash2,
  advertencia: AlertTriangle,
  info: Info,
  exito: CheckCircle2,
};

const titulosPorDefecto = {
  peligro: "¿Estás seguro?",
  advertencia: "Confirmar acción",
  info: "Confirmar",
  exito: "Confirmar",
};

const iconosToast = {
  success: <CheckCircle2 size={22} />,
  error: <XCircle size={22} />,
  warning: <AlertTriangle size={22} />,
  info: <Info size={22} />,
  default: <Info size={22} />,
};

function DialogoConfirmacion() {
  const [solicitud, setSolicitud] = useState<SolicitudConfirmacion | null>(
    null
  );
  const botonConfirmarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    mostrarDialogo = (nueva) => {
      setSolicitud((actual) => {
        actual?.resolver(false);
        return nueva;
      });
    };

    return () => {
      mostrarDialogo = null;
    };
  }, []);

  const cerrar = (valor: boolean) => {
    solicitud?.resolver(valor);
    setSolicitud(null);
  };

  useEffect(() => {
    if (!solicitud) return;

    botonConfirmarRef.current?.focus();

    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar(false);
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [solicitud]);

  if (!solicitud) return null;

  const tipo = solicitud.tipo ?? "advertencia";
  const Icono = iconos[tipo];

  return (
    <div
      className="confirmacion-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrar(false);
      }}
    >
      <div
        className={`confirmacion-dialogo confirmacion-${tipo}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-mensaje"
      >
        <button
          type="button"
          className="confirmacion-cerrar"
          aria-label="Cerrar"
          onClick={() => cerrar(false)}
        >
          <X size={18} />
        </button>

        <div className="confirmacion-icono">
          <Icono size={28} />
        </div>

        <h3 id="confirmacion-titulo">
          {solicitud.titulo ?? titulosPorDefecto[tipo]}
        </h3>

        <p id="confirmacion-mensaje">{solicitud.mensaje}</p>

        <div className="confirmacion-acciones">
          <button
            type="button"
            className="confirmacion-btn confirmacion-btn-cancelar"
            onClick={() => cerrar(false)}
          >
            {solicitud.textoCancelar ?? "Cancelar"}
          </button>

          <button
            type="button"
            ref={botonConfirmarRef}
            className="confirmacion-btn confirmacion-btn-confirmar"
            onClick={() => cerrar(true)}
          >
            {solicitud.textoConfirmar ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Se monta una sola vez en la raíz de la aplicación.
 */
export default function Notificaciones() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        draggable
        transition={Slide}
        hideProgressBar={false}
        icon={({ type }) => iconosToast[type] ?? iconosToast.default}
        toastClassName="notificacion"
      />
      <DialogoConfirmacion />
    </>
  );
}
