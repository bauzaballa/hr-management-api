import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 90,
    title: "Notificaciones Internas",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 90,
      taskTemplateId: 90,
      title: "Datos",
      typeStep: "director",
      subTitle: "Datos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 91,
      taskTemplateId: 90,
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
      id: 90,
      taskStepId: 90,
      label: "Motivo",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Escribir",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 91,
      taskStepId: 90,
      label: "Vía de comunicación",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Escribir",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 92,
      taskStepId: 90,
      label: "Asunto",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Nombre",
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 93,
      taskStepId: 90,
      label: "Texto de notificación",
      type: "textarea",
      directionMapOption: "row",
      placeHolder: "Escribir",
      required: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS COLABORADOR ===
    {
      id: 94,
      taskStepId: 91,
      label: "Notificación",
      type: "archivo",
      directionMapOption: "row",
      placeHolder: "Cargar Documento",
      required: false,
      order: 1,
      limitFile: 3,
      isMultiple: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${[90, 91, 92, 93, 94]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[90, 91]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${90}`);
}
