import { neon } from "@neondatabase/serverless";
const createRide = async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is missing");
        }
        const sql = neon(process.env.DATABASE_URL); // ✅ moved here
        const { origin_address, destination_address, origin_latitude, origin_longitude, destination_latitude, destination_longitude, ride_time, fare_price, payment_status, driver_id, user_id, } = req.body;
        if (!origin_address ||
            !destination_address ||
            origin_latitude === undefined ||
            origin_longitude === undefined ||
            destination_latitude === undefined ||
            destination_longitude === undefined ||
            !ride_time ||
            !fare_price ||
            !payment_status ||
            !driver_id ||
            !user_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const response = await sql `
      INSERT INTO rides (
        origin_address,
        destination_address,
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
        ride_time,
        fare_price,
        payment_status,
        driver_id,
        user_id
      ) VALUES (
        ${origin_address},
        ${destination_address},
        ${origin_latitude},
        ${origin_longitude},
        ${destination_latitude},
        ${destination_longitude},
        ${ride_time},
        ${fare_price},
        ${payment_status},
        ${driver_id},
        ${user_id}
      )
      RETURNING *;
    `;
        res.status(201).json({ data: response[0] });
    }
    catch (error) {
        console.error("❌ Error creating ride:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export default createRide;
