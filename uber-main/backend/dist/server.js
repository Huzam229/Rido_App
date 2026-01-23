import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
// Import routers AFTER dotenv.config()
import driverRouter from "./api/driver.js";
import usersRouter from "./api/user.js";
import rideRouter from "./api/ride.js";
import stripeRouter from "./api/stripe.js";
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// Health check
app.get("/", (_req, res) => {
    res.send("Server is Live!");
});
// API routes
app.use("/api/driver", driverRouter);
app.use("/api/users", usersRouter);
app.use("/api/ride", rideRouter);
app.use("/api/stripe", stripeRouter);
// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "Loaded" : "❌ Missing"}`);
});
