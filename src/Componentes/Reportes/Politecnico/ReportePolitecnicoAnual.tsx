import "./ReportePolitecnicoAnual.css";
import logoImage from "../../imagenes/logo-mir.png";
import LogoMinerd from "../../imagenes/download.png";
import { filasMaterias, infoGrado, temaGrado } from "../gradoReporte";

interface Props {
  reportes: any[];
  centro: string;
  grado: string;
}

// Colores de cada grado (0 = por defecto)
const paletas: Record<number, Record<string, string>> = {
  0: { circulo: "#a9e8e4", "circulo-texto": "#76e9e2", acento: "#1e8e88", label: "#b8e6cd", th: "#b8e6cd", shaded: "#dbf3e9", barra: "#12a79d" },
  4: { circulo: "#a9e8e4", "circulo-texto": "#76e9e2", acento: "#1e8e88", label: "#b8e6cd", th: "#b8e6cd", shaded: "#dbf3e9", barra: "#12a79d" },
  5: { circulo: "#d60b52", "circulo-texto": "#d60b52", acento: "#d60b52", label: "#e6b8cf", th: "#ffdbe4", shaded: "#f3dbed", barra: "#d60b52" },
  6: { circulo: "#1f75bc", "circulo-texto": "#1f75bc", acento: "#1f75bc", label: "#b8c9e6", th: "#b8c9e6", shaded: "#dbe5f3", barra: "#1f75bc" },
};

const materiasBase = [
  "Lengua Española",
  "Lenguas Extranjeras - Inglés",
  "Matemática",
  "Ciencias Sociales",
  "Ciencias de la Naturaleza",
  "Educación Artística",
  "Educación Física",
  "Formación Integral Humana y Religiosa",
];

const ReportePolitecnicoAnual = ({ reportes, centro, grado }: Props) => {
  if (!reportes || reportes.length === 0) return null;

  const info = infoGrado(grado);
  const tema = temaGrado(paletas, info.numero);

  return (
    <div className="reportes-politecnico-anual">
      {reportes.map((r, index) => {
        const normales = r.materiasNormales ?? r.MateriasNormales ?? [];
        const tecnicas = r.materiasTecnicas ?? r.MateriasTecnicas ?? [];

        const filas = filasMaterias(materiasBase, normales);

        return (
          <div className="reporte-politecnico-anual" key={r.idEstudiante ?? index} style={tema}>
            <header className="rpol-header">
              <div className="rpol-logos">
                <div className="rpol-logo-text">
                   <img src={LogoMinerd} alt="Logo institución" className="rpol-logo-real" />
                   </div>
                <div className="rpol-logos-mir">
                <img src={logoImage} alt="Logo institución" className="rpol-logo-real" />
              </div>
              </div>

              <div className="rpol-titulo">
              <h2>{centro}</h2>
                <h3>Año Escolar {r.anioEscolar ?? r.AnioEscolar ?? "2025-2026"}</h3>
                <h3>CALIFICACIONES DE RENDIMIENTO</h3>
              </div>

              <div className="rpol-grado">
                <span className="rpol-numero">{info.numero || grado}</span>
                <div>
                  <span className="rpol-to">{info.sufijo}</span>
                  <span className="rpol-grado-texto">Grado</span>
                  <p>NIVEL POLITÉCNICO</p>
                </div>
              </div>
            </header>

            <div className="rpol-nombre-container">
              <div className="rpol-nombre-label">NOMBRES Y APELLIDOS</div>
              <div className="rpol-nombre-estudiante">
                {r.estudiante ?? r.Estudiante}
              </div>
            </div>

            <table className="rpol-tabla">
              <thead>
                <tr>
                  <th rowSpan={3} className="rpol-area">
                    ÁREAS<br />CURRICULARES
                  </th>
                  <th colSpan={5}>CALIFICACIONES DE RENDIMIENTO</th>
                  <th rowSpan={3}>%<br />A-A</th>
                  <th colSpan={4}>CALIFICACIÓN COMPLETIVA</th>
                  <th colSpan={4}>CALIFICACIÓN EXTRAORDINARIA</th>
                  <th colSpan={2}>EVALUACIÓN<br />ESPECIAL</th>
                  <th colSpan={2}>SITUACIÓN<br />FINAL</th>
                </tr>

                <tr>
                  <th>PC 1</th>
                  <th>PC 2</th>
                  <th>PC 3</th>
                  <th>PC 4</th>
                  <th className="vertical">CALIFICACIÓN FINAL DEL ÁREA</th>

                  <th className="vertical">50% C.F.</th>
                  <th className="vertical">C.E.C</th>
                  <th className="vertical">50% C.E.C.</th>
                  <th className="vertical shaded">C.C.F.</th>

                  <th className="vertical">30% C.F.</th>
                  <th className="vertical">C.E.EX.</th>
                  <th className="vertical">70% C.E.EX.</th>
                  <th className="vertical shaded">C.EX.F.</th>

                  <th className="vertical">C.F.</th>
                  <th className="vertical shaded">C.E.</th>

                  <th>A</th>
                  <th>R</th>
                </tr>
              </thead>

              <tbody>
                {filas.map(({ nombre: nombreMateria, materia: m }) => {

                  return (
                    <tr key={nombreMateria}>
                      <td className="materia-nombre">{nombreMateria}</td>
                      <td>{m?.pC1 ?? m?.PC1 ?? ""}</td>
                      <td>{m?.pC2 ?? m?.PC2 ?? ""}</td>
                      <td>{m?.pC3 ?? m?.PC3 ?? ""}</td>
                      <td>{m?.pC4 ?? m?.PC4 ?? ""}</td>
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

            <h3 className="rpol-tecnicas-title">MATERIAS TÉCNICAS</h3>

            <table className="rpol-tabla-tecnica">
              <thead>
                <tr>
                  <th>Materia técnica</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i}>RA{i + 1}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {tecnicas.map((m: any, i: number) => (
                  <tr key={i}>
                    <td>{m.materia ?? m.Materia}</td>
                    <td>{m.rA1 ?? m.RA1 ?? ""}</td>
                    <td>{m.rA2 ?? m.RA2 ?? ""}</td>
                    <td>{m.rA3 ?? m.RA3 ?? ""}</td>
                    <td>{m.rA4 ?? m.RA4 ?? ""}</td>
                    <td>{m.rA5 ?? m.RA5 ?? ""}</td>
                    <td>{m.rA6 ?? m.RA6 ?? ""}</td>
                    <td>{m.rA7 ?? m.RA7 ?? ""}</td>
                    <td>{m.rA8 ?? m.RA8 ?? ""}</td>
                    <td>{m.rA9 ?? m.RA9 ?? ""}</td>
                    <td>{m.rA10 ?? m.RA10 ?? ""}</td>
                    <td>{m.rA11 ?? m.RA11 ?? ""}</td>
                    <td>{m.rA12 ?? m.RA12 ?? ""}</td>
                    <td>{m.total ?? m.Total ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="rpol-firmas">
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

             <div className="rpol-bloque-observacion-competencias">
              <div className="rpol-observaciones">
                <strong>Observaciones:</strong>
              </div>

              <div className="rpol-competencias">
                <p>PC1 Comunicativa</p>
                <p>PC2 Pensamiento Lógico, Creativo y Crítico | Resolución de Problema</p>
                <p>PC3 Científica y Tecnológica | Ambiental y de la Salud</p>
                <p>PC4 Ética y Ciudadana | Desarrollo Personal y Espiritual</p>
                <p>RA1 - RA12 Resultados de Aprendizaje de los módulos técnicos</p>
              </div>
            </div>

            <div className="rpol-footer">
              <div className="rpol-situacion">
                <strong>Situación de la Estudiante (Marcar con una X)</strong>
                <p>□ Promovida</p>
                <p>□ Promovida con asignatura pendiente</p>
                <p>□ Repitente</p>
              </div>

              <div className="rpol-leyenda">
                <strong>Leyenda</strong>
                <p>
                  PC Promedio Grupo de Competencia | RA Resultado de Aprendizaje |
                  % A.A. Porciento Asistencia Anual | C.F. Calificación Final |
                  C.E.C. Calificación Evaluación Completiva | C.C.F. Calificación
                  Completiva Final | C.E.EX. Calificación Evaluación Extraordinaria |
                  C.EX.F Calificación Extraordinaria Final | C.E. Calificación Especial |
                  A. Aprobado | R. Reprobado
                </p>
              </div>
            </div>
                <div className="rpol-creditos">
              LICDA.JUANA GIL DE LA ROSA | Coordinadora Pedagógica
            </div>
              </div>
           
        );
      })}
    </div>
  );
};

export default ReportePolitecnicoAnual;