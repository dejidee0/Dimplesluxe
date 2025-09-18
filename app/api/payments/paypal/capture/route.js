import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");

  if (!token || !orderId || !orderNumber) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancelled=true`
    );
  }

  try {
    // Authenticate with PayPal
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalUrl =
      process.env.PAYPAL_SANDBOX_URL || "https://api-m.sandbox.paypal.com";

    const authResponse = await fetch(`${paypalUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to authenticate with PayPal");
    }

    const { access_token } = await authResponse.json();

    // Capture PayPal payment
    const captureResponse = await fetch(
      `${paypalUrl}/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!captureResponse.ok) {
      throw new Error("Failed to capture PayPal payment");
    }

    const captureData = await captureResponse.json();
    if (captureData.status !== "COMPLETED") {
      throw new Error("Payment not completed");
    }

    // Verify order exists in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("order_number", orderNumber)
      .eq("status", "pending")
      .single();

    if (orderError || !order) {
      throw new Error("Invalid or already processed order");
    }

    // Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Redirect to success URL
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?success=true&orderId=${orderId}&orderNumber=${orderNumber}`
    );
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/orderNumber=${orderNumber}?cancelled=true`
    );
  }
}
