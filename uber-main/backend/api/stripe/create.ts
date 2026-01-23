import dotenv from "dotenv";
dotenv.config(); // MUST be called at the top
import { Request, Response } from "express";
import Stripe from "stripe";

// const key = process.env.STRIPE_SECRET_KEY;
//
// console.log("From Create",key)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
});

const createPayment = async (req: Request, res: Response) => {
    try {
        const { name, email, amount } = req.body;

        console.log("🔍 Create payment request:", { name, email, amount });

        if (!name || !email || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let customer;
        const doesCustomerExist = await stripe.customers.list({
            email,
        });

        if (doesCustomerExist.data.length > 0) {
            customer = doesCustomerExist.data[0];
            console.log("✅ Existing customer found:", customer.id);
        } else {
            const newCustomer = await stripe.customers.create({
                name,
                email,
            });
            customer = newCustomer;
            console.log("✅ New customer created:", customer.id);
        }

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: "2024-06-20" }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount) * 100,
            currency: "usd",
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });

        console.log("✅ Payment intent created:", paymentIntent.id);

        res.json({
            paymentIntent: paymentIntent,
            ephemeralKey: ephemeralKey,
            customer: customer.id,
        });
    } catch (error) {
        console.error("❌ Error creating payment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export default createPayment;