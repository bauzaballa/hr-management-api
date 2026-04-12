import { eq, or } from "drizzle-orm";
import { jobPosition } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  const positions = [
    "Administración y Datos",
    "Analista",
    "Arquitecta",
    "Cafetería",
    "Community Manager",
    "Comercial",
    "Corresponsal",
    "Data Analyst",
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Desarrollador Fullstack",
    "Director",
    "Diseñador Gráfico",
    "Diseñador UX/UI",
    "Filmmaker",
    "Finanzas y Contable",
    "Fotógrafo",
    "Innovación y Nuevos Negocios",
    "Jefe Redacción",
    "Maestranza",
    "Marketing",
    "Medios La Plata",
    "Medios Mendoza",
    "Operaciones",
    "Periodista",
    "QA Manual",
    "Redactor",
    "RRHH",
    "RRHH Hard",
    "RRHH Soft",
    "Seguridad",
    "Sereno",
    "Coordinador",
    "Supervisor",
    "Supervisor de Cobranzas y Atención Postventa",
    "Team Leader",
    "Tesorero",
    "Vendedor",
  ];

  // Insertar solo posiciones que no existan
  for (const positionName of positions) {
    const existing = await db
      .select()
      .from(jobPosition)
      .where(eq(jobPosition.name, positionName))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(jobPosition).values({
        name: positionName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Insertado: ${positionName}`);
    } else {
      console.log(`Ya existe: ${positionName}`);
    }
  }
}

export async function unseed() {
  // Eliminar los registros que insertamos
  const positionsToDelete = [
    "Administración y Datos",
    "Analista",
    "Arquitecta",
    "Cafetería",
    "Community Manager",
    "Comercial",
    "Corresponsal",
    "Data Analyst",
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Desarrollador Fullstack",
    "Director",
    "Diseñador Gráfico",
    "Diseñador UX/UI",
    "Filmmaker",
    "Finanzas y Contable",
    "Fotógrafo",
    "Innovación y Nuevos Negocios",
    "Jefe Redacción",
    "Maestranza",
    "Marketing",
    "Medios La Plata",
    "Medios Mendoza",
    "Operaciones",
    "Periodista",
    "QA Manual",
    "Redactor",
    "RRHH",
    "RRHH Hard",
    "RRHH Soft",
    "Seguridad",
    "Sereno",
    "Coordinador",
    "Supervisor",
    "Supervisor de Cobranzas y Atención Postventa",
    "Team Leader",
    "Tesorero",
    "Vendedor",
  ];

  // Crear condiciones OR para todos los nombres
  const conditions = positionsToDelete.map((name) => eq(jobPosition.name, name));

  if (conditions.length > 0) {
    await db.delete(jobPosition).where(or(...conditions));
  }
}
