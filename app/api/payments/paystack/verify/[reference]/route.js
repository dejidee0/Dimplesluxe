import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../../../lib/supabase";

export async function GET(request, { params }) {
  try {
    const { reference } = params;

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await response.json();

    if (!result.status) {
      throw new Error(result.message || "Payment verification failed");
    }

    const supabase = createServerSupabaseClient();

    if (result.data.status === "success") {
      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", result.data.metadata.orderNumber);

      if (orderError) {
        console.error("Error updating order:", orderError);
        throw orderError;
      }

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        order_id: result.data.metadata.orderId,
        payment_intent_id: result.data.reference,
        provider: "paystack",
        method: result.data.channel,
        amount: result.data.amount / 100,
        currency: result.data.currency,
        status: "succeeded",
      });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        throw paymentError;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
