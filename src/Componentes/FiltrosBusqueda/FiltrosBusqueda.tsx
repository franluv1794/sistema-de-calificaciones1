import { Search, X } from "lucide-react";
import "../../Styles/FiltrosBusqueda.css";

export interface FiltroSelect {
  clave: string;
  etiqueta: string;
  valor: string;
  opciones: string[];
  onChange: (valor: string) => void;
}

interface Props {
  busqueda: string;
  onBusqueda: (valor: string) => void;
  placeholder?: string;
  filtros: FiltroSelect[];
  /** Sin total no se muestra el contador (p. ej. cuando la tabla está paginada) */
  total?: number;
  filtrados?: number;
  onLimpiar: () => void;
}

/**
 * Normaliza un texto para comparar sin mayúsculas ni acentos.
 */
export const normalizarBusqueda = (texto: unknown) =>
  String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/**
 * Valores únicos y ordenados de una lista, sin vacíos.
 */
export const opcionesUnicas = (valores: (string | null | undefined)[]) =>
  Array.from(
    new Set(valores.filter((v): v is string => !!v && v.trim() !== ""))
  ).sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

const FiltrosBusqueda = ({
  busqueda,
  onBusqueda,
  placeholder = "Buscar...",
  filtros,
  total,
  filtrados,
  onLimpiar,
}: Props) => {
  const hayFiltros = busqueda.trim() !== "" || filtros.some((f) => f.valor);

  return (
    <div className="filtros-busqueda">
      <div className="filtros-fila">
        <label className="filtros-buscador">
          <Search size={18} />
          <input
            type="search"
            value={busqueda}
            placeholder={placeholder}
            onChange={(e) => onBusqueda(e.target.value)}
          />
        </label>

        {filtros
          .filter((f) => f.opciones.length > 0)
          .map((f) => (
            <label className="filtros-select" key={f.clave}>
              <span>{f.etiqueta}</span>
              <select
                value={f.valor}
                onChange={(e) => f.onChange(e.target.value)}
              >
                <option value="">Todos</option>
                {f.opciones.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </label>
          ))}
      </div>

      <div className="filtros-resumen">
        {total !== undefined ? (
          <span>
            Mostrando <strong>{filtrados}</strong> de <strong>{total}</strong>
          </span>
        ) : (
          <span />
        )}

        {hayFiltros && (
          <button type="button" className="filtros-limpiar" onClick={onLimpiar}>
            <X size={14} /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltrosBusqueda;
