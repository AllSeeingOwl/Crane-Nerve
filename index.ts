import { Router, type IRouter } from "express";
import healthRouter from "./src/lib/health.js";

const router: IRouter = Router();

router.use(healthRouter);

export default router;
