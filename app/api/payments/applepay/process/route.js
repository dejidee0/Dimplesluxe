import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../../lib/supabase";

export async function POST(request) {
  try {
    const { payment, orderData } = await request.json();

    // Process Apple Pay payment
    // In production, you would validate the payment token with your payment processor

    const supabase = createServerSupabaseClient();

    // Update order status
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", orderData.orderNumber);

    if (orderError) {
      console.error("Error updating order:", orderError);
      throw orderError;
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderData.orderId,
      payment_intent_id: `apple_pay_${Date.now()}`,
      provider: "apple_pay",
      method: "apple_pay",
      amount: orderData.total,
      currency: orderData.currency,
      status: "succeeded",
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw paymentError;
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Apple Pay processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
