export function normalizeToUrl(name: string) {
  return name
    .toLowerCase() // Convierte todo a minúsculas
    .normalize('NFD') // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos y diacríticos
    .replace(/[^a-z0-9 ]/g, '') // Elimina caracteres no alfanuméricos excepto espacios
    .trim() // Elimina espacios en blanco al principio y al final
    .replace(/\s+/g, '-'); // Reemplaza espacios con guiones
}
