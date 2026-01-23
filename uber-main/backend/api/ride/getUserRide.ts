import { Request, Response } from "express";
import { neon } from "@neondatabase/serverless";

const getUserRide = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log("🔍 getUserRide called with ID:", id);

    if (!id) {
        console.log("❌ No user ID provided");
        return res.status(400).json({ error: "Missing user id" });
    }

    try {
        const sql = neon(process.env.DATABASE_URL!);

        console.log("📊 Querying database for user_id:", id);

        const response = await sql`
            SELECT
                rides.ride_id,
                rides.origin_address,
                rides.destination_address,
                rides.origin_latitude,
                rides.origin_longitude,
                rides.destination_latitude,
                rides.destination_longitude,
                rides.ride_time,
                rides.fare_price,
                rides.payment_status,
                rides.created_at,
                json_build_object(
                        'driver_id', drivers.id,
                        'first_name', drivers.first_name,
                        'last_name', drivers.last_name,
                        'profile_image_url', drivers.profile_image_url,
                        'car_image_url', drivers.car_image_url,
                        'car_seats', drivers.car_seats,
                        'rating', drivers.rating
                ) AS driver
            FROM rides
                     INNER JOIN drivers ON rides.driver_id = drivers.id
            WHERE rides.user_id = ${id}
            ORDER BY rides.created_at DESC;
        `;

        console.log("✅ Query successful. Found", response.length, "rides");
        console.log("📦 Response data:", JSON.stringify(response, null, 2));

        // IMPORTANT: Wrap in { data: response } to match frontend expectations
        res.json({ data: response });
    } catch (error) {
        console.error("❌ Error fetching user rides:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export default getUserRide;