import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, amount, currency, orderId, orderNumber } =
      await request.json();

    // Validate amount
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount: must be a positive integer in kobo" },
        { status: 400 }
      );
    }

    // Validate currency
    if (currency !== "NGN") {
      return NextResponse.json(
        { error: "Paystack only supports NGN" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          currency,
          reference: `DLX_${orderId}_${orderNumber}`,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderNumber}`,
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack API error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
