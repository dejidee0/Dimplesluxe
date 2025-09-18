import { NextResponse } from "next/server";
import fetch from "node-fetch";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Change to 'https://api-m.paypal.com' for production

async function getAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error(
      "Missing PayPal credentials: PAYPAL_CLIENT_ID or PAYPAL_SECRET not set"
    );
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    "base64"
  );
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error?.description || "Failed to get PayPal access token"
    );
  }
  return data.access_token;
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Initialize request body:", body); // Debug log
    const { amount, currency, orderId, orderNumber, email, items, shipping } =
      body;

    // Validate input
    if (!amount || !currency || !orderId || !orderNumber || !email || !items) {
      return NextResponse.json(
        { status: false, message: "Missing required fields in request body" },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderNumber,
          amount: {
            currency_code: currency,
            value: amount,
            breakdown: {
              item_total: {
                currency_code: currency,
                value: (parseFloat(amount) - parseFloat(shipping)).toFixed(2),
              },
              shipping: {
                currency_code: currency,
                value: shipping,
              },
            },
          },
          items: items.map((item) => ({
            name: item.name || "Unknown Item",
            description: item.description || "",
            unit_amount: {
              currency_code: currency,
              value: parseFloat(item.price).toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
        },
      ],
      payer: {
        email_address: email,
      },
      application_context: {
        return_url: `http://localhost:3000/order-confirmation/${orderNumber}?cancelled=false`,
        cancel_url: `http://localhost:3000/order-confirmation/${orderNumber}?cancelled=true`,
      },
    };

    console.log("Creating PayPal order with data:", orderData); // Debug log

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log("PayPal API response:", data); // Debug log

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message: data.error?.message || "Failed to create PayPal order",
        },
        { status: 500 }
      );
    }

    const approveUrl = data.links.find((link) => link.rel === "approve")?.href;
    if (!approveUrl) {
      return NextResponse.json(
        { status: false, message: "No approval URL returned from PayPal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: true, approve_url: approveUrl });
  } catch (error) {
    console.error("PayPal initialize error:", error.message);
    return NextResponse.json(
      { status: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
