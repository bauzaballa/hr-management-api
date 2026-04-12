import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 40,
    title: "Mandar mail de bienvenida y formularios",
    subarea: "Soft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values({
    id: 40,
    taskTemplateId: 40,
    title: "Datos",
    typeStep: "director",
    subTitle: "Mail de bienvenida",
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
  });

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 40,
      taskStepId: 40,
      label: "Nombre",
      type: "texto",
      placeHolder: "Nombre",
      directionMapOption: "row",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 41,
      taskStepId: 40,
      label: "Observaciones",
      type: "textarea",
      placeHolder: "Observaciones",
      directionMapOption: "row",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${[40, 41]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} = ${40}`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${40}`);
}
