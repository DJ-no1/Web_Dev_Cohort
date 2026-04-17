import { Router } from "express";
import * as seatController from "./seat.controller.js";

const router = Router();

router.get("/", seatController.getSeats);

export default router;
