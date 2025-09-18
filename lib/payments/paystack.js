import { fetchLiveExchangeRate } from "../exchangeRates";

// Paystack integration for Nigerian and international payments
export const initializePaystackPayment = async (orderData) => {
  try {
    let amount = orderData.total;
    let currency = orderData.currency;

    // Convert to NGN and kobo if currency is not NGN
    if (currency !== "NGN") {
      const exchangeRate = await fetchLiveExchangeRate(currency, "NGN");
      amount = convertToNGN(amount, exchangeRate);
      currency = "NGN";
    } else {
      amount = convertToNGN(amount, 1); // Already in NGN, just convert to kobo
    }

    // Validate amount
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Invalid amount: must be a positive integer in kobo");
    }

    const response = await fetch("/api/payments/paystack/initialize", {
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
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Payment initialization failed");
    }

    // Redirect to Paystack checkout
    window.location.href = data.data.authorization_url;

    return data;
  } catch (error) {
    console.error("Paystack initialization error:", error);
    throw error;
  }
};

export const verifyPaystackPayment = async (reference) => {
  try {
    const response = await fetch(`/api/payments/paystack/verify/${reference}`);
    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Payment verification failed");
    }

    return data;
  } catch (error) {
    console.error("Paystack verification error:", error);
    throw error;
  }
};

// Convert amount to NGN kobo (1 NGN = 100 kobo)
export const convertToNGN = (amount, exchangeRate = 1850) => {
  const converted = amount * exchangeRate * 100;
  return Math.round(converted); // Ensure integer for kobo
};
