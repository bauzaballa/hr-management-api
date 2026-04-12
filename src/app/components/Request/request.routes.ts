import { Router } from "express";
import { getAllRequests, getRequestById } from "./controllers/GET";
import { createRequest } from "./controllers/POST";
import { updateRequest } from "./controllers/PUT";

const router = Router();

router.post("/request/create", createRequest);
router.put("/request/:id", updateRequest);
router.get("/requests", getAllRequests);
router.get("/request/:id", getRequestById);

export default router;
