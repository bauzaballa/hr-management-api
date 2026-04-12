import { activity } from "./activity.schema";
import { applicant } from "./applicant";
import { jobPosition } from "./jobPosition.schema";
import { observationApplicant } from "./observationAplicant.schema";
import { request, requestRelations } from "./request.schema";
import { requestDepartment } from "./requestDepartment.schema";
import { requestTemplate, requestTemplateRelations } from "./requestTemplate.schema";
import { requestTemplateField, requestTemplateFieldRelations } from "./requestTemplateField.schema";
import {
  requestTemplateFieldValue,
  requestTemplateFieldValueRelations,
} from "./requestTemplateFieldValue.schema";
import { seedersLog } from "./seederLog.schema";
import { task, taskRelations } from "./task.schema";
import { taskField, taskFieldRelations } from "./taskField.schema";
import { taskFieldValue, taskFieldValueRelations } from "./taskFieldValue.schema";
import { taskStep, taskStepRelations } from "./taskStep.schema";
import { taskTemplate, taskTemplateRelations } from "./taskTemplate.schema";

export * from "./activity.schema";
export * from "./applicant";
export * from "./jobPosition.schema";
export * from "./observationAplicant.schema";
export * from "./request.schema";
export * from "./requestDepartment.schema";
export * from "./requestTemplate.schema";
export * from "./requestTemplateField.schema";
export * from "./requestTemplateFieldValue.schema";
export * from "./seederLog.schema";
export * from "./task.schema";
export * from "./taskField.schema";
export * from "./taskFieldValue.schema";
export * from "./taskStep.schema";
export * from "./taskTemplate.schema";

export const schema = {
  activity,

  request,
  requestTemplate,
  requestTemplateField,
  requestTemplateFieldValue,
  requestDepartment,

  seedersLog,

  task,
  taskField,
  taskFieldValue,
  taskStep,
  taskTemplate,
  applicant,
  observationApplicant,

  jobPosition,

  requestRelations,
  requestTemplateFieldRelations,
  requestTemplateFieldValueRelations,
  requestTemplateRelations,

  taskRelations,
  taskFieldRelations,
  taskFieldValueRelations,
  taskStepRelations,
  taskTemplateRelations,
};
