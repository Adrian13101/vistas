import { Router } from "express";
import { renderHome, renderRealtimeServices, renderBookings } from "../controllers/views.controller.js";

const router = Router();

router.get("/", renderHome);
router.get("/realtimeservices", renderRealtimeServices);
router.get("/bookings", renderBookings);

export default router;
