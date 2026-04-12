import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 130,
    title: "Charlas",
    subarea: "Soft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 130,
      taskTemplateId: 130,
      title: "Datos",
      typeStep: "director",
      subTitle: "Charlas",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 131,
      taskTemplateId: 130,
      title: "Detalle",
      typeStep: "colaborador",
      subTitle: "Capacitaciones", // Nota: Dice "Capacitaciones" no "Charlas"
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]);

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 140,
      taskStepId: 130,
      label: "Tema de abordaje",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Detallar",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 141,
      taskStepId: 130,
      label: "Objetivo",
      type: "texto",
      directionMapOption: "columns",
      placeHolder: "Detallar",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 142,
      taskStepId: 130,
      label: "Destinado a",
      type: "dropdown",
      directionMapOption: "columns",
      options: JSON.stringify(["Presencial", "Virtual", "Hibrido"]),
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 143,
      taskStepId: 130,
      label: "Fecha estimada",
      type: "dropdown",
      placeHolder: "Seleccionar mes",
      directionMapOption: "columns",
      options: JSON.stringify([
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ]),
      required: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 145,
      taskStepId: 130,
      label: "Objetivo",
      type: "opcion-multiple",
      directionMapOption: "columns",
      options: JSON.stringify(["Pedir Presupuesto", "Detallar Proveedores", "Adjuntar Propuestas"]),
      placeHolder: "Escribir",
      required: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 146,
      taskStepId: 130,
      label: "Cantidad de propuestas",
      type: "numero",
      directionMapOption: "columns",
      placeHolder: "2",
      required: false,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 147,
      taskStepId: 130,
      label: "Lugar",
      type: "opcion-multiple",
      options: JSON.stringify(["DELSUD La Plata", "DELSUD Mendoza", "Virtual", "Otro"]),
      directionMapOption: "columns",
      required: false,
      order: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 148,
      taskStepId: 131,
      label: "Titulo de la charla",
      type: "texto",
      directionMapOption: "columns",
      placeHolder: "Detallar",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 149,
      taskStepId: 131,
      label: "Fechas posibles",
      type: "fecha",
      isMultiple: true,
      placeHolder: "Seleccionar fechas",
      directionMapOption: "columns",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 150,
      taskStepId: 131,
      label: "Presupuesto",
      type: "texto",
      placeHolder: "Detallar",
      directionMapOption: "columns",
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 151,
      taskStepId: 131,
      label: "Propuestas",
      type: "archivo",
      placeHolder: "Cargar documento",
      directionMapOption: "grid",
      isMultiple: true,
      required: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  // Eliminar en orden inverso
  await db
    .delete(taskField)
    .where(sql`${taskField.id} IN (${[140, 141, 142, 143, 145, 146, 147, 148, 149, 150, 151]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[130, 131]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${130}`);
}
