import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";
import { apiAuth } from "../../../src/shared/utils";

export async function seed() {
  // Generar UUIDs para el applicant
  const applicantId = uuidv4();

  // Obtener datos de APIs
  let dataDepartments: string[] = [];
  let dataUnit: string[] = [];

  try {
    // Obtener departamentos
    const deptResponse = await apiAuth.get("/department/get-all");
    dataDepartments = deptResponse.data.map((el: any) => el.name);

    // Obtener unidades
    const unitResponse = await apiAuth.get("/unit/get-all");
    dataUnit = unitResponse.data.map((el: any) => el.name);
  } catch (error) {
    console.error("Error obteniendo datos de APIs:", error);
    // Valores por defecto
    dataDepartments = ["Departamento 1", "Departamento 2"];
    dataUnit = ["Unidad 1", "Unidad 2"];
  }

  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 110,
    title: "Abrir Busqueda",
    subarea: "Soft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 110,
      taskTemplateId: 110,
      title: "Datos",
      typeStep: "director",
      subTitle: "Datos básicos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 111,
      taskTemplateId: 110,
      title: "Detalle",
      typeStep: "director",
      subTitle: "Detalle de contratación",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 2,
    },
    {
      id: 112,
      taskTemplateId: 110,
      title: "Reclutar",
      typeStep: "director",
      subTitle: "Reclutamiento",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 3,
    },
    {
      id: 113,
      taskTemplateId: 110,
      title: "Candidatos",
      typeStep: "colaborador",
      subTitle: "Lista de Candidatos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]);

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 103,
      taskStepId: 110,
      label: "Dirección",
      type: "dropdown",
      options: JSON.stringify(dataDepartments),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      required: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 104,
      taskStepId: 110,
      label: "Unidad de negocio",
      type: "dropdown",
      options: JSON.stringify(dataUnit),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      showRequest: true,
      required: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 105,
      taskStepId: 110,
      label: "Empresa",
      type: "dropdown",
      options: JSON.stringify(["Four Capital", "Laniakea"]),
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 3,
      showRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 106,
      taskStepId: 110,
      label: "Sede",
      type: "dropdown",
      options: JSON.stringify(["La Plata", "Mendoza"]),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      required: true,
      order: 4,
      showRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 107,
      taskStepId: 110,
      label: "Cantidad de candidatos",
      type: "numero",
      directionMapOption: "row",
      placeHolder: "10",
      showRequest: true,
      required: true,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 108,
      taskStepId: 110,
      label: "Cantidad de ingresos",
      type: "numero",
      showRequest: true,
      directionMapOption: "row",
      placeHolder: "Escribilo",
      required: true,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 110,
      taskStepId: 110,
      label: "Fecha de vencimiento de la tarea",
      type: "fecha",
      directionMapOption: "row",
      placeHolder: "Escribir",
      required: true,
      order: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS DIRECTIVO PASO 2 ===
    {
      id: 111,
      taskStepId: 111,
      label: "Jornada",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Días y Horario",
      required: true,
      order: 1,
      showRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 112,
      taskStepId: 111,
      label: "Tareas",
      type: "textarea",
      directionMapOption: "row",
      placeHolder: "Indicalas",
      required: true,
      order: 2,
      showRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 113,
      taskStepId: 111,
      label: "Requisitos Deseables",
      type: "textarea",
      directionMapOption: "row",
      placeHolder: "Indicalos",
      required: true,
      order: 3,
      showRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 114,
      taskStepId: 111,
      label: "Requisitos Excluyentes",
      type: "textarea",
      directionMapOption: "row",
      placeHolder: "Indicalos",
      required: true,
      order: 4,
      showRequest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 115,
      taskStepId: 111,
      label: "Modalidad de contratación",
      type: "dropdown",
      options: JSON.stringify(["Relación de dependencia", "Contrato de servicios"]),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      required: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 116,
      taskStepId: 111,
      label: "Convenio",
      type: "opcion-multiple",
      directionMapOption: "grid",
      options: JSON.stringify(["Comercio", "Prensa", "Fuera de convenio", "No corresponde"]),
      required: true,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 117,
      taskStepId: 111,
      label: "Sueldo",
      type: "opcion-multiple",
      directionMapOption: "columns",
      options: JSON.stringify(["Sueldo convenio", "Neto acordado", "No corresponde"]),
      required: true,
      order: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 118,
      taskStepId: 111,
      label: "Contrato",
      type: "opcion-multiple",
      directionMapOption: "grid",
      options: JSON.stringify([
        "Contrato indeterminado",
        "Contrato por proyecto",
        "Contrato por cobertura",
        "No Corresponde",
      ]),
      required: true,
      order: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS DIRECTIVO PASO 3 ===
    {
      id: 119,
      taskStepId: 112,
      label: "",
      type: "checkbox",
      directionMapOption: "columns",
      options: JSON.stringify([
        "Mail",
        "Hunting",
        "Campaña de contenido único",
        "Portal de empleo",
      ]),
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 120,
      taskStepId: 112,
      label: "Campaña de contenido único (de ser necesario)",
      type: "checkbox",
      directionMapOption: "columns",
      options: JSON.stringify(["Linkedin", "Meta"]),
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 121,
      taskStepId: 112,
      label: "Meta (de ser necesario)",
      type: "opcion-multiple",
      directionMapOption: "row",
      options: JSON.stringify(["Publicitar", "No publicitar"]),
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 122,
      taskStepId: 112,
      label: "Portal de Empleo (de ser necesario)",
      type: "opcion-multiple",
      directionMapOption: "row",
      options: JSON.stringify(["Computrabajo", "ZonaJobs", "LinkedIn", "Otros"]),
      required: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 123,
      taskStepId: 112,
      label: "Otro Portal de Empleo (de ser necesario)",
      type: "texto",
      placeHolder: "Escribilo",
      directionMapOption: "row",
      required: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log('Seeder "Abrir Busqueda" ejecutado correctamente');
  console.log("Applicant ID generado:", applicantId);
}

export async function unseed() {
  const fieldIds = [
    103, 104, 105, 106, 107, 108, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
    123,
  ];

  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${fieldIds})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[110, 111, 112, 113]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${110}`);

  // Resetear las secuencias (opcional, depende de tu base de datos)
  // Para PostgreSQL:
  try {
    await db.execute(sql`
      SELECT setval('"TaskFields_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "TaskFields"), false);
      SELECT setval('"TaskSteps_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "TaskSteps"), false);
      SELECT setval('"TaskTemplates_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "TaskTemplates"), false);
    `);
  } catch (error) {
    console.log("Nota: No se pudieron resetear las secuencias o no son necesarias");
  }
}
