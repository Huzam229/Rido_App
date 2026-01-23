import express from "express";
import getUserRide from "./ride/getUserRide.js";
import createRide from "./ride/createRide.js"; // <-- the POST handler we made earlier
const router = express.Router();
// Get rides for a user
router.get("/getUserRide/:id", getUserRide);
// Create a new ride
router.post("/createRide", createRide);
export default router;
