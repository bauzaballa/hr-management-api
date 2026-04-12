import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 60,
    title: "Liquidación de sueldos",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 60,
      taskTemplateId: 60,
      title: "Datos",
      typeStep: "director",
      subTitle: "Datos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 61,
      taskTemplateId: 60,
      title: "Detalle",
      typeStep: "colaborador",
      subTitle: "Detalle",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 2,
    },
  ]);

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 60,
      taskStepId: 60,
      label: "Mes",
      type: "texto",
      placeHolder: "Mes de ejemplo",
      directionMapOption: "row",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 61,
      taskStepId: 60,
      label: "Detalle",
      type: "texto",
      placeHolder: "Descripción",
      directionMapOption: "row",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS COLABORADOR ===
    {
      id: 62,
      taskStepId: 61,
      label: "Liquidación",
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
  await db.delete(taskField).where(sql`${taskField.id} IN (${[60, 61, 62]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[60, 61]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${60}`);
}
