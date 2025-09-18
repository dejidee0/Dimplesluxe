export const initializePayPalPayment = async (orderData) => {
  try {
    const amount = orderData.total.toFixed(2);
    const currency = orderData.currency;
    const shipping = orderData.shipping.toFixed(2);

    console.log("Sending PayPal request:", {
      amount,
      currency,
      orderId: orderData.orderId,
    });

    const response = await fetch("/api/payments/paypal/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: orderData.customerEmail,
        amount,
        currency,
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        items: orderData.items,
        shipping,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Non-OK response:", response.status, text);
      throw new Error(
        `HTTP error ${response.status}: ${text || "No response body"}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Payment initialization failed");
    }

    console.log("Redirecting to PayPal:", data.approve_url);
    window.location.href = data.approve_url;

    return data;
  } catch (error) {
    console.error("PayPal initialization error:", error);
    throw error;
  }
};

export const capturePayPalPayment = async (orderId, payerId) => {
  try {
    console.log("Capturing PayPal payment:", { orderId, payerId });
    const response = await fetch("/api/payments/paypal/capture", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, payerId }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Capture non-OK response:", response.status, text);
      throw new Error(
        `HTTP error ${response.status}: ${text || "No response body"}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Capture non-JSON response:", text);
      throw new Error("Server returned non-JSON response");
    }

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Payment capture failed");
    }

    return data;
  } catch (error) {
    console.error("PayPal capture error:", error);
    throw error;
  }
};
