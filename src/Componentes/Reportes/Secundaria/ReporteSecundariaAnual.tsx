import "./ReporteSecundariaAnual.css";
import logoImage from "../../imagenes/Captura de pantalla 2026-06-10 122000.png";
import { filasMaterias, infoGrado, temaGrado } from "../gradoReporte";

interface Props {
  reportes: any[];
  centro: string;
  grado: string;
}

// Colores de cada grado (0 = por defecto)
const paletas: Record<number, Record<string, string>> = {
  0: { acento: "#008b45", acento2: "#63b34b", acento3: "#63b34b", label: "#b9c9e5", th: "#e4f1dd", area: "#c7e3b6", shaded: "#c7e3b6" },
  1: { acento: "#008b45", acento2: "#63b34b", acento3: "#63b34b", label: "#b9c9e5", th: "#e4f1dd", area: "#c7e3b6", shaded: "#c7e3b6" },
  2: { acento: "#1d72b8", acento2: "#2aa7df", acento3: "#2aa7df", label: "#b9c9e5", th: "#b9c9e5", area: "#dce5f3", shaded: "#b9c9e5" },
  3: { acento: "#d54c0c", acento2: "#f5a11a", acento3: "#f05a28", label: "#f7c7a6", th: "#f7c7a6", area: "#f7c7a6", shaded: "#f5dfcf" },
  4: { acento: "#c2185b", acento2: "#ec407a", acento3: "#ec407a", label: "#f8c7da", th: "#fbe0ea", area: "#f8c7da", shaded: "#f8c7da" },
  5: { acento: "#6a1b9a", acento2: "#9c4dcc", acento3: "#9c4dcc", label: "#dcc6ea", th: "#ede0f5", area: "#dcc6ea", shaded: "#dcc6ea" },
  6: { acento: "#00796b", acento2: "#26a69a", acento3: "#26a69a", label: "#b2dfdb", th: "#e0f2f1", area: "#b2dfdb", shaded: "#b2dfdb" },
};

const materiasBase = [
  "Lengua Española",
  "Lenguas Extranjeras - Inglés",
  "Matemática",
  "Ciencias Sociales",
  "Naturales",
  "Educación Artística",
  "Educación Física",
  "Formación Integral Humana y Religiosa",
];

const ReporteSecundariaAnual = ({ reportes, centro, grado }: Props) => {
  if (!reportes || reportes.length === 0) return null;

  const info = infoGrado(grado);
  const tema = temaGrado(paletas, info.numero);

  return (
    <div className="reportes-anuales-secundaria">
      {reportes.map((r, index) => {
        const materias = r.materias ?? r.Materias ?? [];

        const filas = filasMaterias(materiasBase, materias);

        return (
          <div className="reporte-secundaria-anual" key={r.idEstudiante ?? index} style={tema}>
            <div className="rsa-header">
              <div className="rsa-logos">
                <img src={logoImage} alt="Logo institución" className="rsa-logo-real" />
              </div>

              <div className="rsa-titulo">
                <h2>{centro}</h2>
                <h3>Año Escolar {r.anioEscolar ?? r.AnioEscolar ?? "2025-2026"}</h3>
                <h3>CALIFICACIONES DE RENDIMIENTO</h3>
              </div>

              <div className="rsa-grado">
                <span className="rsa-numero">{info.numero || grado}</span>
                <div>
                  <span className="rsa-er">{info.sufijo}</span>
                  <span className="rsa-grado-texto">Grado</span>
                  <p>{info.ciclo}</p>
                  <p>NIVEL SECUNDARIO</p>
                </div>
              </div>
            </div>

            <div className="rsa-nombre-container">
              <div className="rsa-nombre-label">NOMBRES Y APELLIDOS</div>
              <div className="rsa-nombre-linea">
                <strong>{r.estudiante ?? r.Estudiante}</strong>
              </div>
            </div>

            <table className="rsa-tabla">
              <thead>
                <tr>
                  <th rowSpan={4} className="rsa-area">
                    ÁREAS<br />CURRICULARES
                  </th>
                  <th colSpan={5}>CALIFICACIONES DE RENDIMIENTO</th>
                  <th rowSpan={4}>%<br />A-A</th>
                  <th colSpan={4}>CALIFICACIÓN COMPLETIVA</th>
                  <th colSpan={4}>CALIFICACIÓN EXTRAORDINARIA</th>
                  <th colSpan={2}>EVALUACIÓN<br />ESPECIAL</th>
                  <th colSpan={2}>SITUACIÓN<br />FINAL EN LA<br />ASIGNATURA</th>
                </tr>

                <tr>
                  <th colSpan={4}>
                    PROMEDIO GRUPO DE<br />COMPETENCIAS ESPECÍFICAS
                  </th>
                  <th rowSpan={3} className="vertical">
                    CALIFICACIÓN<br />FINAL DEL ÁREA
                  </th>

                  <th rowSpan={3} className="vertical">50% C.F.</th>
                  <th rowSpan={3} className="vertical">C.E.C</th>
                  <th rowSpan={3} className="vertical">50% C.E.C.</th>
                  <th rowSpan={3} className="vertical shaded">C.C.F.</th>

                  <th rowSpan={3} className="vertical">30% C.F.</th>
                  <th rowSpan={3} className="vertical">C.E.EX.</th>
                  <th rowSpan={3} className="vertical">70% C.E.EX.</th>
                  <th rowSpan={3} className="vertical shaded">C.EX.F.</th>

                  <th rowSpan={3} className="vertical">C.F.</th>
                  <th rowSpan={3} className="vertical shaded">C.E.</th>

                  <th rowSpan={3}>A</th>
                  <th rowSpan={3}>R</th>
                </tr>

                <tr>
                  <th>PC 1</th>
                  <th>PC 2</th>
                  <th>PC 3</th>
                  <th>PC 4</th>
                </tr>
              </thead>

              <tbody>
                {filas.map(({ nombre: nombreMateria, materia: m }) => {

                  return (
                    <tr key={nombreMateria}>
                      <td className="materia-nombre">{nombreMateria}</td>
                      <td>{m?.pc1 ?? m?.pC1 ?? m?.PC1 ?? ""}</td>
                      <td>{m?.pc2 ?? m?.pC2 ?? m?.PC2 ?? ""}</td>
                      <td>{m?.pc3 ?? m?.pC3 ?? m?.PC3 ?? ""}</td>
                      <td>{m?.pc4 ?? m?.pC4 ?? m?.PC4 ?? ""}</td>
                      <td className="shaded">{m?.finalArea ?? m?.FinalArea ?? ""}</td>

                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="shaded"></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="shaded"></td>
                      <td></td>
                      <td className="shaded"></td>
                      <td></td>
                      <td></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="rsa-firmas">
              <div>
                <span></span>
                <p>Maestro/a encargado del curso</p>
              </div>

              <div>
                <span></span>
                <strong>Licda. Yira Cedeño</strong>
                <p>Directora del Centro</p>
              </div>
            </div>

            <div className="rsa-bloque-observacion-competencias">
              <div className="rsa-observaciones">
                <strong>Observaciones:</strong>
              </div>

              <div className="rsa-competencias">
                <p>PC1 Comunicativa</p>
                <p>PC2 Pensamiento Lógico, Creativo y Crítico | Resolución de Problema</p>
                <p>PC3 Científica y Tecnológica | Ambiental y de la Salud</p>
                <p>PC4 Ética y Ciudadana | Desarrollo Personal y Espiritual</p>
              </div>
            </div>

            <div className="rsa-footer">
              <div className="rsa-situacion">
                <strong>Situación de la Estudiante (Marcar con una X)</strong>
                <p>□ Promovida</p>
                <p>□ Promovida con asignatura pendiente</p>
                <p>□ Repitente</p>
              </div>

              <div className="rsa-leyenda">
                <strong>Leyenda</strong>
                <p>
                  PC Promedio Grupo de Competencia | % A.A. Porciento Asistencia Anual |
                  C.F. Calificación Final | C.E.C. Calificación Evaluación Completiva |
                  C.C.F. Calificación Completiva Final | C.E.EX. Calificación Evaluación
                  Extraordinaria | C.EX.F Calificación Extraordinaria Final | C.E.
                  Calificación Especial | A. Aprobado | R. Reprobado
                </p>
              </div>
            </div>

            <div className="rsa-creditos">
              Mtra. Kaira Herrera | Coordinadora Pedagógica
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReporteSecundariaAnual;