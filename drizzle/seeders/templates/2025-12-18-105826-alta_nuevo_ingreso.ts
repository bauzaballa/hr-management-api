import { sql } from "drizzle-orm";
import { jobPosition, taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";
import { apiAuth } from "../../../src/shared/utils";

export async function seed() {
  // Obtener datos de unidades de la API
  let dataUnit: string[] = [];
  try {
    const response = await apiAuth.get("/unit/get-all");
    dataUnit = response.data.map((el: any) => el.name);
  } catch (error) {
    console.error("Error obteniendo unidades:", error);
    dataUnit = ["Unidad 1", "Unidad 2", "Unidad 3"]; // Valores por defecto
  }

  // Obtener puestos de trabajo de la base de datos
  const jobPositions = await db.select({ name: jobPosition.name }).from(jobPosition);
  const jobPositionNames = jobPositions.map((jp: any) => jp.name);

  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 140,
    title: "Alta de Nuevo Ingreso",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 140,
      taskTemplateId: 140,
      title: "Datos",
      typeStep: "director",
      subTitle: "Datos básicos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 141,
      taskTemplateId: 140,
      title: "Requisitos",
      typeStep: "colaborador",
      subTitle: "Requisitos",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
  ]);

  // Insertar Fields
  await db.insert(taskField).values([
    {
      id: 152,
      taskStepId: 140,
      label: "Puesto",
      type: "dropdown",
      options: JSON.stringify(jobPositionNames),
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 153,
      taskStepId: 140,
      label: "Dirección",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 154,
      taskStepId: 140,
      label: "Unidad de negocio",
      type: "dropdown",
      options: JSON.stringify(dataUnit),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      showRequest: true,
      required: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 155,
      taskStepId: 140,
      label: "Empresa",
      type: "dropdown",
      options: JSON.stringify(["Delsud", "Four Capital"]),
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 156,
      taskStepId: 140,
      label: "Sede",
      type: "dropdown",
      options: JSON.stringify(["La Plata", "Mendoza"]),
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 157,
      taskStepId: 140,
      label: "Jornada",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 158,
      taskStepId: 140,
      label: "Modalidad de contratación",
      type: "dropdown",
      options: JSON.stringify(["Relación de dependencia", "Contrato de servicios"]),
      placeHolder: "Seleccionar",
      directionMapOption: "columns",
      required: true,
      order: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 159,
      taskStepId: 140,
      label: "Convenio",
      type: "dropdown",
      directionMapOption: "columns",
      options: JSON.stringify(["Comercio", "Prensa", "Fuera de convenio", "No corresponde"]),
      placeHolder: "Seleccionar",
      required: true,
      order: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 160,
      taskStepId: 140,
      label: "Sueldo",
      type: "opcion-multiple",
      options: JSON.stringify(["Sueldo convenio", "Neto acordado", "No corresponde"]),
      directionMapOption: "row",
      placeHolder: "Seleccionar",
      required: true,
      order: 9, // Nota: Original tenía order: 6, pero debería ser 9 para mantener secuencia
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 161,
      taskStepId: 140,
      label: "Contrato",
      type: "dropdown",
      directionMapOption: "row",
      options: JSON.stringify([
        "Contrato indeterminado",
        "Contrato por proyecto",
        "Contrato por cobertura",
        "No Corresponde",
      ]),
      placeHolder: "Seleccionar",
      required: true,
      order: 10, // Original tenía order: 7
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 162,
      taskStepId: 140,
      label: "Nombre y Apellido del Candidato",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 11, // Original tenía order: 8
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 163,
      taskStepId: 140,
      label: "Email del Candidato",
      type: "texto",
      directionMapOption: "row",
      placeHolder: "Especificar",
      required: true,
      order: 12, // Original tenía order: 9
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 164,
      taskStepId: 140,
      label: "Fecha de ingreso",
      type: "fecha",
      directionMapOption: "row",
      placeHolder: "Escribir",
      required: true,
      order: 13, // Original tenía order: 10
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 165,
      taskStepId: 140,
      label: "Documento del candidato",
      type: "archivo",
      directionMapOption: "grid",
      placeHolder: "Cargar documento",
      required: true,
      order: 14, // Original tenía order: 10 (duplicado)
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 166,
      taskStepId: 141,
      label: "Formulario Email",
      type: "archivo",
      directionMapOption: "grid",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 167,
      taskStepId: 141,
      label: "Alta ARCA",
      type: "checkbox",
      options: JSON.stringify([
        "Crear documento de alta en ARCA.",
        "Hacer firmar el documento por la persona en el momento de su ingreso.",
      ]),
      directionMapOption: "columns",
      required: false,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 168,
      taskStepId: 141,
      label: "Documentos Alta ARCA",
      type: "archivo",
      directionMapOption: "grid",
      required: false,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 169,
      taskStepId: 141,
      label: "Contrato laboral",
      type: "checkbox",
      options: JSON.stringify([
        "Crear contrato correspondiente.",
        "Hacer firmar el documento por la persona en el momento de su ingreso.",
      ]),
      directionMapOption: "columns",
      required: false,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 170,
      taskStepId: 141,
      label: "Documentos Contrato laboral",
      type: "archivo",
      directionMapOption: "grid",
      required: false,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 171,
      taskStepId: 141,
      label: "DDJJ de domicilio",
      type: "checkbox",
      options: JSON.stringify([
        "Recibir declaración jurada completa de domicilio.",
        "Hacer firmar el documento al ingresar.",
      ]),
      directionMapOption: "columns",
      required: false,
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 172,
      taskStepId: 141,
      label: "Documentos DDJJ de domicilio",
      type: "archivo",
      directionMapOption: "grid",
      required: false,
      order: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 173,
      taskStepId: 141,
      label: "Alta de Obra Social (OS)",
      type: "opcion-multiple",
      options: JSON.stringify([
        "Se adhiere a nuestro convenio.",
        "Continúa con su obra social actual (no requiere acción adicional).",
        "Indefinido (si no hay información al momento del ingreso.",
      ]),
      directionMapOption: "columns",
      required: false,
      order: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 174,
      taskStepId: 141,
      label: "Fecha estimada",
      type: "dropdown",
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
      directionMapOption: "columns",
      required: false,
      order: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 175,
      taskStepId: 141,
      label: "",
      type: "checkbox",
      options: JSON.stringify(["Dado de alta"]),
      directionMapOption: "columns",
      required: false,
      order: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function unseed() {
  const fieldIds = [
    152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170,
    171, 172, 173, 174, 175,
  ];

  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${fieldIds})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[140, 141]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${140}`);
}
