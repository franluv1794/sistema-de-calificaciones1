import type { CSSProperties } from "react";

const palabrasGrado: Record<string, number> = {
  primer: 1,
  primero: 1,
  segundo: 2,
  tercer: 3,
  tercero: 3,
  cuarto: 4,
  quinto: 5,
  sexto: 6,
};

const sufijos: Record<number, string> = {
  1: "ro",
  2: "do",
  3: "ro",
  4: "to",
  5: "to",
  6: "to",
};

const nombresGrado: Record<number, string> = {
  1: "PRIMER",
  2: "SEGUNDO",
  3: "TERCER",
  4: "CUARTO",
  5: "QUINTO",
  6: "SEXTO",
};

/**
 * Obtiene el número del grado a partir del texto que envía el backend
 * ("4to", "4to Grado", "Cuarto", etc.).
 */
export const numeroGrado = (grado: string = ""): number => {
  const digito = grado.match(/\d+/);
  if (digito) return Number(digito[0]);

  const texto = grado
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const palabra = Object.keys(palabrasGrado).find((p) => texto.includes(p));
  return palabra ? palabrasGrado[palabra] : 0;
};

export const infoGrado = (grado: string = "") => {
  const numero = numeroGrado(grado);

  return {
    numero,
    sufijo: sufijos[numero] ?? "",
    // "1ro", "2do", "4to"...
    ordinal: numero ? `${numero}${sufijos[numero] ?? ""}` : grado,
    // "CUARTO GRADO"
    nombre: nombresGrado[numero]
      ? `${nombresGrado[numero]} GRADO`
      : grado.toUpperCase(),
    ciclo: numero >= 4 ? "SEGUNDO CICLO" : "PRIMER CICLO",
  };
};

/**
 * Devuelve la paleta del grado como variables CSS para aplicarla
 * en el contenedor del reporte.
 */
export const temaGrado = (
  paletas: Record<number, Record<string, string>>,
  numero: number
): CSSProperties => {
  const paleta = paletas[numero] ?? paletas[0];

  return Object.fromEntries(
    Object.entries(paleta).map(([clave, color]) => [`--${clave}`, color])
  ) as CSSProperties;
};

const normalizarTexto = (texto: string = "") =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Otros nombres con los que puede venir cada materia desde la base de datos
const aliasMaterias: Record<string, string[]> = {
  "lengua espanola": ["espanol"],
  "lenguas extranjeras": ["ingles", "frances", "lengua extranjera"],
  "matematica": ["matematicas"],
  "ciencias sociales": ["sociales"],
  "ciencias de la naturaleza": ["naturales", "ciencias naturales", "naturaleza"],
  "naturales": ["ciencias de la naturaleza", "ciencias naturales", "naturaleza"],
  "educacion artistica": ["artistica"],
  "educacion fisica": ["deporte"],
  "formacion integral humana y religiosa": ["formacion integral", "religion", "fihr"],
};

const variantes = (nombreBase: string) => {
  const base = normalizarTexto(nombreBase);
  const clave = Object.keys(aliasMaterias).find(
    (k) => base === k || base.startsWith(k)
  );
  return [base, ...(clave ? [clave, ...aliasMaterias[clave]] : [])];
};

const coincide = (nombreBase: string, nombreMateria: string) => {
  const materia = normalizarTexto(nombreMateria);
  if (!materia) return false;

  // Solo si el nombre real contiene la variante, para que "Física"
  // no caiga en "Educación Física"
  return variantes(nombreBase).some(
    (v) => materia === v || materia.includes(v)
  );
};

/**
 * Arma las filas del reporte: primero las materias del formato oficial
 * (en su orden) y al final cualquier materia del estudiante que no
 * coincida con ninguna, para que ninguna nota se pierda.
 */
export const filasMaterias = (
  materiasBase: string[],
  materias: any[],
  obtenerNombre: (m: any) => string = (m) => m?.materia ?? m?.Materia ?? ""
) => {
  const usadas = new Set<any>();

  const filas = materiasBase.map((nombre) => {
    // Primero la coincidencia exacta, luego por alias
    const exacta = materias.find(
      (m) =>
        !usadas.has(m) &&
        normalizarTexto(obtenerNombre(m)) === normalizarTexto(nombre)
    );
    const materia =
      exacta ??
      materias.find((m) => !usadas.has(m) && coincide(nombre, obtenerNombre(m)));

    if (materia) usadas.add(materia);
    return { nombre, materia };
  });

  const extras = materias
    .filter((m) => !usadas.has(m) && obtenerNombre(m))
    .map((m) => ({ nombre: obtenerNombre(m), materia: m }));

  return [...filas, ...extras];
};
