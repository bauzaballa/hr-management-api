import { Router } from "express";
import { deleteRequestTemplate } from "./controllers/DELETE";
import { getAllRequestTemplate, getRequestTemplate } from "./controllers/GET";
import { createRequestTemplate } from "./controllers/POST";
import { updateRequestTemplate } from "./controllers/PUT";

const router = Router();

router.get("/request-template/get-all", getAllRequestTemplate);
router.get("/request-template/:id", getRequestTemplate);
router.post("/request-template", createRequestTemplate);
router.put("/request-template/:id", updateRequestTemplate);
router.delete("/request-template/:id", deleteRequestTemplate);

export default router;
