import { Router, Request, Response } from "express";
import { neon } from "@neondatabase/serverless";

const router = Router();

export interface Driver {
    id: number;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    car_image_url: string;
    car_seats: number;
    rating: number;
}

router.get("/", async (req: Request, res: Response) => {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const response = await sql`SELECT * FROM drivers`;
        const drivers: Driver[] = response as Driver[];
        res.status(200).json({ data: drivers }); // Add explicit status
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
