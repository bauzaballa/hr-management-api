import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 50,
    title: "Cambio OS",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values({
    id: 50,
    taskTemplateId: 50,
    title: "Datos",
    typeStep: "director",
    subTitle: "Cambio Obra Social",
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
  });

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 50,
      taskStepId: 50,
      label: "Nombre",
      type: "texto",
      placeHolder: "Nombre",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 51,
      taskStepId: 50,
      label: "Obra Social",
      type: "texto",
      placeHolder: "Nombre",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${[50, 51]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} = ${50}`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${50}`);
}
