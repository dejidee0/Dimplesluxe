import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const orderData = await request.json();

    // Determine payment method types based on selected payment method
    const getPaymentMethodTypes = (paymentMethod, currency, billingCountry) => {
      const methods = [];

      // Always include card (this automatically includes Apple Pay when available)
      methods.push("card");

      // Add PayPal for supported regions
      if (paymentMethod === "paypal" || paymentMethod === "card") {
        if (
          ["GB", "US", "CA", "AU", "DE", "FR", "ES", "IT", "NL"].includes(
            billingCountry
          )
        ) {
          methods.push("paypal");
        }
      }

      // Note: Apple Pay is automatically available through 'card' when:
      // - Customer is using Safari on iOS/macOS
      // - Customer has Apple Pay set up
      // - Merchant supports Apple Pay (enabled in Stripe Dashboard)

      return methods;
    };

    const paymentMethodTypes = getPaymentMethodTypes(
      orderData.paymentMethod,
      orderData.currency,
      orderData.billingCountry || "GB"
    );

    // Create Stripe checkout session with enhanced configuration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: orderData.items.map((item) => ({
        price_data: {
          currency: orderData.currency.toLowerCase(),
          product_data: {
            name: item.name,
            description:
              item.description || "Premium hair product from Dimplesluxe",
            images: item.images?.slice(0, 8) || [], // Stripe allows max 8 images
            metadata: {
              product_type: "hair_product",
              category: "beauty",
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),

      // Add shipping as a line item for better transparency
      ...(orderData.shipping > 0 && {
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
                  ? "Express Delivery (1-2 business days)"
                  : "Standard Delivery (3-5 business days)",
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
              metadata: {
                method: orderData.shippingMethod,
              },
            },
          },
        ],
      }),

      mode: "payment",

      // Success and cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderData.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?cancelled=true`,

      // Customer information
      customer_email: orderData.customerEmail,

      // Metadata for order tracking
      metadata: {
        orderId: orderData.orderId.toString(),
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        paymentMethod: orderData.paymentMethod,
        shippingMethod: orderData.shippingMethod,
        source: "dimplesluxe_website",
      },

      // Address collection
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: [
          "GB",
          "US",
          "CA",
          "AU",
          "IE",
          "FR",
          "DE",
          "ES",
          "IT",
          "NL",
        ],
      },

      // Payment method configuration for better UX
      payment_method_configuration: undefined, // Use default config

      // Enhanced features - only collect consent if terms URL is configured
      // consent_collection: {
      //   terms_of_service: "required", // Enable this after setting Terms URL in Stripe Dashboard
      // },

      // Custom branding (if you have Stripe branding configured)
      custom_text: {
        shipping_address: {
          message: "We'll deliver your premium hair products to this address.",
        },
        submit: {
          message: "Complete your Dimplesluxe order securely",
        },
      },

      // Automatic tax calculation (if configured)
      automatic_tax: {
        enabled: false, // Enable if you have Stripe Tax configured
      },

      // PayPal configuration
      ...(paymentMethodTypes.includes("paypal") && {
        payment_method_options: {
          paypal: {
            preferred_locale: "en-GB", // Can be dynamic based on customer location
          },
        },
      }),

      // Expires in 24 hours
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,

      // Phone number collection for delivery
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
      payment_methods: paymentMethodTypes,
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);

    // Return more specific error messages
    const errorMessage = error.message || "Failed to create payment session";
    const errorCode = error.code || "unknown_error";

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        type: error.type || "api_error",
      },
      { status: 500 }
    );
  }
}
