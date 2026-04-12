import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 20,
    title: "Envío Carta documento",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 20,
      taskTemplateId: 20,
      title: "Datos",
      typeStep: "director",
      subTitle: "Datos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 21,
      taskTemplateId: 20,
      title: "Archivo",
      typeStep: "colaborador",
      subTitle: "Archivo",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]);

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 20,
      taskStepId: 20,
      label: "Destinatario",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Nombre y apellido",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 21,
      taskStepId: 20,
      label: "Remitente (empresa)",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Nombre de empresa",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 22,
      taskStepId: 20,
      label: "Fecha",
      placeHolder: "DD/MM/AAAA",
      type: "fecha",
      directionMapOption: "row",
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 23,
      taskStepId: 20,
      label: "Cuerpo de Carta Documento",
      placeHolder: "Escribir cuerpo",
      type: "textarea",
      directionMapOption: "row",
      required: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 24,
      taskStepId: 20,
      label: "Enviada por",
      directionMapOption: "columns",
      options: JSON.stringify(["Web", "En el correo"]),
      type: "checkbox",
      required: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS COLABORADOR ===
    {
      id: 25,
      taskStepId: 21,
      label: "Documentación",
      placeHolder: "Cargar CD",
      type: "archivo",
      directionMapOption: "row",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${[20, 21, 22, 23, 24, 25]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[20, 21]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${20}`);
}
