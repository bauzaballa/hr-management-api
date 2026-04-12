import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 70,
    title: "Bajas",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 70,
      taskTemplateId: 70,
      title: "Datos",
      typeStep: "director",
      subTitle: "Datos de la baja",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 71,
      taskTemplateId: 70,
      title: "Detalle",
      typeStep: "colaborador",
      subTitle: "Detalle",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]);

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 70,
      taskStepId: 70,
      label: "Nombre del colaborador",
      type: "texto",
      placeHolder: "Nombre",
      directionMapOption: "row",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS COLABORADOR ===
    {
      id: 71,
      taskStepId: 70,
      label: "Motivo de baja",
      type: "dropdown",
      options: JSON.stringify(["Renuncia", "Despido", "Fin de contrato", "Otros"]),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 72,
      taskStepId: 71,
      label: "Bajas",
      type: "archivo",
      placeHolder: "Cargar documento",
      directionMapOption: "grid",
      limitFile: 3,
      isMultiple: true,
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${[70, 71, 72]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[70, 71]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${70}`);
}
