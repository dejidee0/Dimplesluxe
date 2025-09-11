import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const orderData = await request.json();

    // Convert GBP to NGN (Paystack primarily works with NGN)
    const amountInKobo = Math.round(
      orderData.total * orderData.exchangeRate * 100
    );

    const paystackData = {
      email: orderData.customerEmail,
      amount: amountInKobo,
      currency: "NGN",
      reference: `DLX_${orderData.orderNumber}_${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderData.orderNumber}`,
      metadata: {
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        items: orderData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackData),
      }
    );

    const result = await response.json();

    if (!result.status) {
      throw new Error(result.message || "Payment initialization failed");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
