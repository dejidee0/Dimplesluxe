import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const orderData = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: orderData.items.map((item) => ({
        price_data: {
          currency: orderData.currency.toLowerCase(),
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images || [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(orderData.shipping * 100),
              currency: orderData.currency.toLowerCase(),
            },
            display_name:
              orderData.shippingMethod === "express"
                ? "Express Delivery"
                : "Standard Delivery",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: orderData.shippingMethod === "express" ? 1 : 3,
              },
              maximum: {
                unit: "business_day",
                value: orderData.shippingMethod === "express" ? 2 : 5,
              },
            },
          },
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderData.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      customer_email: orderData.customerEmail,
      metadata: {
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
      },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "CA", "AU", "NG"],
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
