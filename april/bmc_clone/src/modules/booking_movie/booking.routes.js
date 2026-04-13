import { Router } from "express";
import * as controller from "./booking.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", authenticate, controller.createBooking);
router.get("/", authenticate, controller.getBookings);
router.get("/:bookingId", authenticate, controller.getBooking);
router.delete("/:bookingId", authenticate, controller.cancelBooking);

export default router;
