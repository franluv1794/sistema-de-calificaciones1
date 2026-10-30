import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api/axiosConfig";

export interface ResultadoPaginado<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

/**
 * Carga un listado paginado desde el servidor.
 * Al cambiar los filtros vuelve a la página 1; la búsqueda se espera
 * un momento antes de consultar para no pedir en cada tecla.
 */
export const usePaginado = <T,>(
  url: string,
  filtros: Record<string, string>,
  tamanoInicial = 20
) => {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(tamanoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const clave = JSON.stringify(filtros);
  const [filtrosAplicados, setFiltrosAplicados] = useState(clave);

  useEffect(() => {
    const espera = setTimeout(() => {
      setFiltrosAplicados(clave);
      setPagina(1);
    }, 350);

    return () => clearTimeout(espera);
  }, [clave]);

  // Evita que una respuesta lenta pise a una más reciente
  const ultimaPeticion = useRef(0);

  const cargar = useCallback(async () => {
    const id = ++ultimaPeticion.current;
    const params = Object.fromEntries(
      Object.entries(JSON.parse(filtrosAplicados)).filter(([, v]) => v !== "")
    );

    try {
      setCargando(true);
      setError(null);

      const res = await api.get<ResultadoPaginado<T>>(url, {
        params: { ...params, pagina, tamanoPagina },
      });

      if (id !== ultimaPeticion.current) return;

      setItems(res.data.items);
      setTotal(res.data.total);
      setTotalPaginas(res.data.totalPaginas);

      if (res.data.pagina !== pagina) setPagina(res.data.pagina);
    } catch (e) {
      if (id === ultimaPeticion.current) setError(e);
    } finally {
      if (id === ultimaPeticion.current) setCargando(false);
    }
  }, [url, filtrosAplicados, pagina, tamanoPagina]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarTamano = (tamano: number) => {
    setTamanoPagina(tamano);
    setPagina(1);
  };

  return {
    items,
    total,
    pagina,
    totalPaginas,
    tamanoPagina,
    cargando,
    error,
    setPagina,
    cambiarTamano,
    recargar: cargar,
  };
};
