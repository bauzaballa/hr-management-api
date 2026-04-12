import { Router } from "express";
import { deleteTask } from "./controllers/DELETE";
import { getAllTask, getTask } from "./controllers/GET";
import { createTask } from "./controllers/POST";
import { updateTask } from "./controllers/PUT";

const router = Router();

router.get("/task/all", getAllTask);
router.get("/task/:id", getTask);
router.post("/task", createTask);
router.put("/task/:id", updateTask);
router.delete("/task/:id", deleteTask);

export default router;
