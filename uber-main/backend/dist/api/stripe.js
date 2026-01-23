import express from "express";
import createPayment from "./stripe/create.js";
import payPayment from "./stripe/pay.js";
const router = express.Router();
// Route: POST /api/stripe/create
router.post("/create", createPayment);
// Route: POST /api/stripe/pay
router.post("/pay", payPayment);
export default router;
