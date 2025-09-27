const { Config, Client, CheckoutAPI } = require("@adyen/api-library");

const config = new Config();
config.apiKey = process.env.ADYEN_API_KEY;
config.merchantAccount = process.env.ADYEN_MERCHANT_ACCOUNT;

const client = new Client({ config });
const checkout = new CheckoutAPI(client);

export async function POST(request) {
  try {
    const data = await request.json();

    const sessionRequest = {
      merchantAccount: config.merchantAccount,
      amount: { value: data.amount, currency: data.currency },
      reference: data.reference,
      returnUrl: `${request.headers.get(
        "origin"
      )}/checkout?sessionId={sessionId}&orderId=${data.orderId}&orderNumber=${
        data.reference
      }`,
      countryCode: data.countryCode,
      shopperLocale: "en-GB", // Adjust based on needs
      channel: "Web",
      allowedPaymentMethods: [
        "card",
        "klarna",
        "paypal",
        "applepay",
        "googlepay",
      ],
      lineItems: data.lineItems,
      shopperName: data.shopperName,
      shopperEmail: data.shopperEmail,
      billingAddress: data.billingAddress,
      telephoneNumber: data.telephoneNumber,
    };

    const response = await checkout.sessions(sessionRequest);

    return new Response(
      JSON.stringify({
        id: response.id,
        sessionData: response.sessionData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
