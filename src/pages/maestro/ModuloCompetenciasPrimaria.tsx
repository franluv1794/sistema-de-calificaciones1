import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import "../../Styles/ModuloCompetenciasPrimaria.css";
import { confirmar } from "../../Componentes/Notificaciones/Notificaciones";

interface Props {
  idAsignacionDocente: number;
  idGrado: number;
  idMateria: number;
  idPeriodo: string;
  estudiantes: any[];
}

interface Competencia {
  idCompetencia: number;
  codigo: string;
  nombre: string;
}

interface Estudiante {
  idEstudiante: number;
  matricula?: string;
  nombres: string;
  apellidos: string;
}

interface NotaExistente {
  idEstudiante: number;
  idCompetencia: number;
  nota: number | null;
  publicada: boolean;
}

const ModuloCompetenciasPrimaria = ({
  idAsignacionDocente,
  idPeriodo,
}: Props) => {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>([]);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [puedeEditar, setPuedeEditar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [materia, setMateria] = useState("");
  const [periodo, setPeriodo] = useState("");

  const clave = (idEstudiante: number, idCompetencia: number) =>
    `${idEstudiante}-${idCompetencia}`;

  const cargarCaptura = async () => {
    if (!idAsignacionDocente || !idPeriodo) return;
    setCargando(true);
    try {
      const res = await api.get(
        `/CalificacionesCompetenciasPeriodo/captura-directa`,
        { params: { idAsignacionDocente, idPeriodoPublicacion: Number(idPeriodo) } }
      );
      const data = res.data;
      const competenciasApi = (data.competencias ?? data.Competencias ?? []).map((c: any) => ({
        idCompetencia: c.idCompetencia ?? c.IdCompetencia,
        codigo: c.codigo ?? c.Codigo,
        nombre: c.nombre ?? c.Nombre,
      }));
      const estudiantesApi = (data.estudiantes ?? data.Estudiantes ?? []).map((e: any) => ({
        idEstudiante: e.idEstudiante ?? e.IdEstudiante,
        matricula: e.matricula ?? e.Matricula,
        nombres: e.nombres ?? e.Nombres ?? "",
        apellidos: e.apellidos ?? e.Apellidos ?? "",
      }));
      const calificaciones: NotaExistente[] = (data.calificaciones ?? data.Calificaciones ?? []).map((n: any) => ({
        idEstudiante: n.idEstudiante ?? n.IdEstudiante,
        idCompetencia: n.idCompetencia ?? n.IdCompetencia,
        nota: n.nota ?? n.Nota ?? n.promedio ?? n.Promedio ?? null,
        publicada: n.publicada ?? n.Publicada ?? false,
      }));

      const notasIniciales: Record<string, string> = {};
      calificaciones.forEach((n) => {
        notasIniciales[clave(n.idEstudiante, n.idCompetencia)] =
          n.nota == null ? "" : String(n.nota);
      });
      setCompetencias(competenciasApi);
      setListaEstudiantes(estudiantesApi);
      setNotas(notasIniciales);
      console.log("RESPUESTA CAPTURA DIRECTA:", data);
console.log("PUEDE EDITAR:", data.puedeEditar, data.PuedeEditar);
      setPuedeEditar(Boolean(data.puedeEditar ?? data.PuedeEditar));
      
      setMateria(data.materia ?? data.Materia ?? "");
      setPeriodo(data.periodo ?? data.Periodo ?? "");
    } catch (error: any) {
      console.error("Error cargando captura directa:", error);
      toast.error(
        typeof error.response?.data === "string"
          ? error.response.data
          : "No se pudo cargar la captura directa de competencias."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarCaptura();
    // Los identificadores determinan la captura que se carga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAsignacionDocente, idPeriodo]);

  const cantidadNotas = useMemo(
    () => Object.values(notas).filter((valor) => valor.trim() !== "").length,
    [notas]
  );

  const cambiarNota = (idEstudiante: number, idCompetencia: number, valor: string) => {
    if (valor !== "" && (!/^\d+(\.\d{0,2})?$/.test(valor) || Number(valor) < 0 || Number(valor) > 100)) return;
    setNotas((actuales) => ({ ...actuales, [clave(idEstudiante, idCompetencia)]: valor }));
  };

  const guardarNotas = async () => {
    if (!puedeEditar) {
      toast.warning("Este período no permite editar notas o las calificaciones ya fueron publicadas.");
      return;
    }
    if (!competencias.length || !listaEstudiantes.length) {
      toast.warning("No hay estudiantes o competencias para guardar.");
      return;
    }

    const payloadNotas = listaEstudiantes.flatMap((estudiante) =>
      competencias
        .filter((competencia) => (notas[clave(estudiante.idEstudiante, competencia.idCompetencia)] ?? "").trim() !== "")
        .map((competencia) => ({
          idEstudiante: estudiante.idEstudiante,
          idCompetencia: competencia.idCompetencia,
          nota: Number(notas[clave(estudiante.idEstudiante, competencia.idCompetencia)]),
        }))
    );

    if (!payloadNotas.length) {
      toast.warning("Introduce al menos una nota antes de guardar.");
      return;
    }

    setGuardando(true);
    try {
      await api.put("/CalificacionesCompetenciasPeriodo/guardar-directas", {
        idAsignacionDocente,
        idPeriodoPublicacion: Number(idPeriodo),
        notas: payloadNotas,
      });
      toast.success("Notas directas guardadas correctamente.");
      await cargarCaptura();
    } catch (error: any) {
      console.error("Error guardando notas directas:", error);
      toast.error(
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.mensaje ?? "No se pudieron guardar las notas."
      );
    } finally {
      setGuardando(false);
    }
  };

  const publicarCalificaciones = async () => {
  if (!puedeEditar) {
    toast.warning("Este período no permite publicar calificaciones.");
    return;
  }

  const confirmado = await confirmar({
    titulo: "Publicar calificaciones",
    mensaje: "¿Deseas publicar las calificaciones de este período? Los estudiantes podrán verlas.",
    textoConfirmar: "Sí, publicar",
    tipo: "info",
  });

  if (!confirmado) return;

  try {
    setGuardando(true);

    await api.put(
      "/CalificacionesCompetenciasPeriodo/publicar",
      null,
      {
        params: {
          idAsignacionDocente,
          idPeriodoPublicacion: Number(idPeriodo),
        },
      }
    );

    toast.success("Calificaciones publicadas correctamente.");
    await cargarCaptura();
  } catch (error: any) {
    toast.error(
      typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.mensaje ||
          "No se pudieron publicar las calificaciones."
    );
  } finally {
    setGuardando(false);
  }
};
  return (
    <div className="modulo-competencias">
      <div className="modulo-competencias-header">
        <div>
          <h2>Calificaciones directas por competencias</h2>
          <p>{materia}{periodo ? ` · ${periodo}` : ""}</p>
        </div>
        <button type="button" onClick={() => void cargarCaptura()} disabled={cargando}>
          Actualizar
        </button>
      </div>

      {cargando ? (
        <p>Cargando estudiantes y competencias...</p>
      ) : !competencias.length || !listaEstudiantes.length ? (
        <p>No hay estudiantes o competencias configuradas para esta asignación y período.</p>
      ) : (
        <>
          <div className="captura-directa-info">
            <span>Estudiantes: {listaEstudiantes.length}</span>
            <span>Competencias: {competencias.length}</span>
            <span>Notas introducidas: {cantidadNotas}</span>
            <span>{puedeEditar ? "Edición habilitada" : "Solo lectura"}</span>
          </div>
          <div className="tabla-calificaciones-directas-wrapper">
            <table className="tabla-calificaciones-directas">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  {competencias.map((competencia) => (
                    <th key={competencia.idCompetencia} title={competencia.nombre}>
                      <strong>{competencia.codigo}</strong>
                      <small>{competencia.nombre}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listaEstudiantes.map((estudiante) => (
                  <tr key={estudiante.idEstudiante}>
                    <td>
                      <strong>{estudiante.apellidos}, {estudiante.nombres}</strong>
                      {estudiante.matricula && <small>{estudiante.matricula}</small>}
                    </td>
                    {competencias.map((competencia) => {
                      const valor = notas[clave(estudiante.idEstudiante, competencia.idCompetencia)] ?? "";
                      return (
                        <td key={competencia.idCompetencia}>
                          <input
                            aria-label={`Nota de ${estudiante.nombres} ${estudiante.apellidos} en ${competencia.codigo}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={valor}
                            disabled={!puedeEditar || guardando}
                            onChange={(e) => cambiarNota(estudiante.idEstudiante, competencia.idCompetencia, e.target.value)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="captura-directa-ayuda">Introduce una nota entre 0 y 100 por competencia. Deja en blanco las notas que todavía no deseas registrar.</p>
          <button type="button" onClick={() => void guardarNotas()} disabled={!puedeEditar || guardando}>
            {guardando ? "Guardando..." : "Guardar calificaciones"}
          </button>
          <button type="button" onClick={() => void publicarCalificaciones()} disabled={!puedeEditar || guardando}>
            {guardando ? "Publicando..." : "Publicar calificaciones"}
          </button>
        </>
      )}
    </div>
  );
};

export default ModuloCompetenciasPrimaria;
