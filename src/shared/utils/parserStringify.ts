export function convertirAJSON<T>(valor: T): string | null {
  try {
    return JSON.stringify(valor);
  } catch (error) {
    console.error('Error al convertir a JSON:', error);
    return null;
  }
}

export function parsearJSON<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error al parsear JSON:', error);
    return null;
  }
}
