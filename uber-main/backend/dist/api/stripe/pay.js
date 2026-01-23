import dotenv from "dotenv";
dotenv.config(); // MUST be called at the top
import Stripe from "stripe";
// const key = process.env.STRIPE_SECRET_KEY;
//
// console.log("From Pay",key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});
const payPayment = async (req, res) => {
    try {
        const { payment_method_id, payment_intent_id, customer_id, client_secret } = req.body;
        console.log("🔍 Pay payment request:", {
            payment_method_id,
            payment_intent_id,
            customer_id,
        });
        if (!payment_method_id || !payment_intent_id || !customer_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const paymentMethod = await stripe.paymentMethods.attach(payment_method_id, { customer: customer_id });
        console.log("✅ Payment method attached:", paymentMethod.id);
        const result = await stripe.paymentIntents.confirm(payment_intent_id, {
            payment_method: paymentMethod.id,
        });
        console.log("✅ Payment confirmed:", result.id, "Status:", result.status);
        res.json({
            success: true,
            message: "Payment successful",
            result: result,
        });
    }
    catch (error) {
        console.error("❌ Error paying:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export default payPayment;
