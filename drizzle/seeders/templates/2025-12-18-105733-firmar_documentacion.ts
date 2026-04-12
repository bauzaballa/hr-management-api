import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 100,
    title: "Firmar documentación",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 100,
      taskTemplateId: 100,
      title: "Datos",
      typeStep: "director",
      subTitle: "Detalle",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 101,
      taskTemplateId: 100,
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
      id: 100,
      taskStepId: 100,
      label: "Nombre del colaborador",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Escribir",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 101,
      taskStepId: 100,
      label: "Especificar documentación",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Detallar motivo",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 102,
      taskStepId: 101,
      label: "Documentación firmada",
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
  await db.delete(taskField).where(sql`${taskField.id} IN (${[100, 101, 102]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[100, 101]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${100}`);
}
