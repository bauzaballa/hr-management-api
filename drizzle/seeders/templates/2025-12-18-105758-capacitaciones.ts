import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";
import { apiAuth } from "../../../src/shared/utils";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 120,
    title: "Capacitaciones",
    subarea: "Soft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 120,
      taskTemplateId: 120,
      title: "Datos",
      typeStep: "director",
      subTitle: "Capacitaciones",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 121,
      taskTemplateId: 120,
      title: "Detalle",
      typeStep: "colaborador",
      subTitle: "Capacitaciones",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]);

  // Obtener departamentos de la API
  let dataDepartments: string[] = [];
  try {
    const response = await apiAuth.get("/department/get-all");
    dataDepartments = response.data.map((el: any) => el.name);
  } catch (error) {
    console.error("Error obteniendo departamentos:", error);
    // Opcional: valores por defecto en caso de error
    dataDepartments = ["Departamento 1", "Departamento 2", "Departamento 3"];
  }

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 130,
      taskStepId: 120,
      label: "Materia de capacitación",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Escribilo",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 131,
      taskStepId: 120,
      label: "Objetivo",
      type: "opcion-multiple",
      directionMapOption: "columns",
      options: JSON.stringify(["Pedir Presupuesto", "Detallar Proveedores", "Adjuntar Propuestas"]),
      placeHolder: "Escribir",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 132,
      taskStepId: 120,
      label: "Modalidad deseada",
      type: "opcion-multiple",
      directionMapOption: "columns",
      options: JSON.stringify(["Presencial", "Virtual", "Hibrido"]),
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 133,
      taskStepId: 120,
      label: "Destinado a",
      type: "dropdown",
      directionMapOption: "columns",
      options: JSON.stringify(dataDepartments),
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 134,
      taskStepId: 120,
      label: "Nombre Colaborador (opcional)",
      type: "texto",
      directionMapOption: "columns",
      placeHolder: "Escribilo",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 135,
      taskStepId: 120,
      label: "Cantidad de propuestas",
      type: "numero",
      directionMapOption: "columns",
      placeHolder: "2",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 136,
      taskStepId: 121,
      label: "Titulo de la capacitación",
      type: "texto",
      directionMapOption: "columns",
      placeHolder: "Detallar",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 137,
      taskStepId: 121,
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
      id: 138,
      taskStepId: 121,
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
      id: 139,
      taskStepId: 121,
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
    .where(sql`${taskField.id} IN (${[130, 131, 132, 133, 134, 135, 136, 137, 138, 139]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[120, 121]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${120}`);
}
