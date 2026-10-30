import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../Styles/Paginacion.css";

interface Props {
  pagina: number;
  totalPaginas: number;
  total: number;
  tamanoPagina: number;
  onPagina: (pagina: number) => void;
  onTamano?: (tamano: number) => void;
  cargando?: boolean;
}

const TAMANOS = [10, 20, 50, 100];

/**
 * Números de página a mostrar, con "…" donde se saltan páginas.
 */
const paginasVisibles = (actual: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...paginas]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const resultado: (number | "…")[] = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });

  return resultado;
};

const Paginacion = ({
  pagina,
  totalPaginas,
  total,
  tamanoPagina,
  onPagina,
  onTamano,
  cargando = false,
}: Props) => {
  const desde = total === 0 ? 0 : (pagina - 1) * tamanoPagina + 1;
  const hasta = Math.min(pagina * tamanoPagina, total);

  return (
    <div className="paginacion">
      <span className="paginacion-resumen">
        {desde}–{hasta} de <strong>{total}</strong>
      </span>

      <div className="paginacion-botones">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina <= 1 || cargando}
          onClick={() => onPagina(pagina - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        {paginasVisibles(pagina, totalPaginas).map((p, i) =>
          p === "…" ? (
            <span key={`salto-${i}`} className="paginacion-salto">
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              className={p === pagina ? "activa" : ""}
              aria-current={p === pagina ? "page" : undefined}
              disabled={cargando}
              onClick={() => onPagina(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Página siguiente"
          disabled={pagina >= totalPaginas || cargando}
          onClick={() => onPagina(pagina + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {onTamano && (
        <label className="paginacion-tamano">
          Por página
          <select
            value={tamanoPagina}
            onChange={(e) => onTamano(Number(e.target.value))}
          >
            {TAMANOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

export default Paginacion;
