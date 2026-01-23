import { Router } from "express";
import { neon } from "@neondatabase/serverless";
const router = Router();
router.get("/", async (req, res) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const response = await sql `SELECT * FROM drivers`;
        const drivers = response;
        res.status(200).json({ data: drivers }); // Add explicit status
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
