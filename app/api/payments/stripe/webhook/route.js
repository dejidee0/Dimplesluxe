import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        // Update order status
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", session.metadata.orderNumber);

        if (orderError) {
          console.error("Error updating order:", orderError);
          throw orderError;
        }

        // Create payment record
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: session.metadata.orderId,
          payment_intent_id: session.payment_intent,
          provider: "stripe",
          method: "card",
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          status: "succeeded",
        });

        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
          throw paymentError;
        }

        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;

        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "failed",
            failure_reason: failedPayment.last_payment_error?.message,
          })
          .eq("payment_intent_id", failedPayment.id);

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
