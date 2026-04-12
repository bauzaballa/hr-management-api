import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 30,
    title: "Fotos institucionales",
    subarea: "Soft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values({
    id: 30,
    taskTemplateId: 30,
    title: "Datos",
    typeStep: "director",
    subTitle: "Comunicar fotos institucionales",
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 1,
  });

  // Insertar Fields
  await db.insert(taskField).values({
    id: 30,
    taskStepId: 30,
    label: "Observaciones",
    type: "textarea",
    placeHolder: "Observaciones",
    directionMapOption: "row",
    required: false,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function unseed() {
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} = ${30}`);

  await db.delete(taskStep).where(sql`${taskStep.id} = ${30}`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${30}`);
}
