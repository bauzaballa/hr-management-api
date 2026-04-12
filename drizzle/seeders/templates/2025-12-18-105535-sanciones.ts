import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 10,
    title: "Sanciones",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 10,
      taskTemplateId: 10,
      title: "Datos",
      typeStep: "director",
      subTitle: "Detalle",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 11,
      taskTemplateId: 10,
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
      id: 10,
      taskStepId: 10,
      label: "Nombre del colaborador afectado",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Nombre",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 11,
      taskStepId: 10,
      label: "Motivo de sanción / Descargo",
      type: "textarea",
      directionMapOption: "row",
      placeHolder: "Observaciones",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 12,
      taskStepId: 10,
      label: "Tipo de sanción solicitada",
      type: "opcion-multiple",
      directionMapOption: "columns",
      options: JSON.stringify(["Apercibimiento", "Suspensión"]),
      placeHolder: "",
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 14,
      taskStepId: 10,
      label: "Cantidad de días de la sanción (si corresponde)",
      type: "numero",
      directionMapOption: "row",
      placeHolder: "5",
      required: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 15,
      taskStepId: 10,
      label: "Fecha de inicio de la sanción (si corresponde)",
      type: "fecha",
      directionMapOption: "row",
      placeHolder: "dd/mm/aaaa",
      required: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 16,
      taskStepId: 10,
      label: "Fecha de finalización de la sanción (si corresponde)",
      type: "fecha",
      directionMapOption: "row",
      placeHolder: "dd/mm/aaaa",
      required: false,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS COLABORADOR ===
    {
      id: 17,
      taskStepId: 11,
      label: "Documento Sanción",
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
  // Eliminar en orden inverso (primero fields, luego steps, luego template)
  await db.delete(taskField).where(sql`${taskField.id} IN (${[10, 11, 12, 14, 15, 16, 17]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[10, 11]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${10}`);
}
