import { sql } from "drizzle-orm";
import { taskField, taskStep, taskTemplate } from "../../../src/app/entities/index";
import { db } from "../../../src/core/database";

export async function seed() {
  // Insertar Template
  await db.insert(taskTemplate).values({
    id: 80,
    title: "Informes",
    subarea: "Hard",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insertar Steps
  await db.insert(taskStep).values([
    {
      id: 80,
      taskTemplateId: 80,
      title: "Datos",
      typeStep: "director",
      subTitle: "Detalle",
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
    },
    {
      id: 81,
      taskTemplateId: 80,
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
      id: 80,
      taskStepId: 80,
      label: "Informe",
      type: "checkbox",
      placeHolder: "",
      options: JSON.stringify([
        "Cargas sociales",
        "Liquidación final estimada",
        "Sueldos estimado",
        "Inasistencias",
        "Legajos",
        "Novedades Mensuales",
      ]),
      directionMapOption: "columns",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // === FIELDS COLABORADOR ===
    {
      id: 81,
      taskStepId: 80,
      label: "Detalle (opcional)",
      type: "textarea",
      placeHolder: "Escribir",
      directionMapOption: "row",
      required: false,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 82,
      taskStepId: 81,
      label: "Informe",
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
  // Eliminar en orden inverso
  await db.delete(taskField).where(sql`${taskField.id} IN (${[80, 81, 82]})`);

  await db.delete(taskStep).where(sql`${taskStep.id} IN (${[80, 81]})`);

  await db.delete(taskTemplate).where(sql`${taskTemplate.id} = ${80}`);
}
