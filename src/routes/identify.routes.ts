import { Router } from "express";
import Identify from "../controllers/identify.controllers";


const router = Router();

router.post("/identify", Identify.identify);

export default router;