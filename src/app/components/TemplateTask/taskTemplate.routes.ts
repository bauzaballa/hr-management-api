import { Router } from "express";
import { deleteTaskTemplate } from "./controllers/DELETE";
import { getTaskTemplates, getTemplateTask } from "./controllers/GET";
import { createTaskTemplate } from "./controllers/POST";
import { updateTemplate } from "./controllers/PUT";

const router = Router();

router.get("/task-template/all", getTaskTemplates);
router.get("/task-template/:id", getTemplateTask);
router.post("/task-template", createTaskTemplate);
router.put("/task-template/:id", updateTemplate);
router.delete("/task-template/:id", deleteTaskTemplate);

export default router;
