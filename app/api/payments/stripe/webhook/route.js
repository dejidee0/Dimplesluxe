import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "../../../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        // Get the payment method details
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent
        );
        const paymentMethod = await stripe.paymentMethods.retrieve(
          paymentIntent.payment_method
        );

        // Determine payment method type
        let methodType = paymentMethod.type;
        let methodDetails = {};

        switch (paymentMethod.type) {
          case "card":
            methodDetails = {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              exp_month: paymentMethod.card.exp_month,
              exp_year: paymentMethod.card.exp_year,
              funding: paymentMethod.card.funding,
              country: paymentMethod.card.country,
            };
            break;
          case "apple_pay":
            methodType = "apple_pay";
            methodDetails = {
              brand: paymentMethod.card?.brand || "unknown",
              last4: paymentMethod.card?.last4 || "****",
              device_type: "apple_device",
            };
            break;
          case "paypal":
            methodType = "paypal";
            methodDetails = {
              payer_email: paymentMethod.paypal?.payer_email,
              payer_id: paymentMethod.paypal?.payer_id,
            };
            break;
        }

        // Update order status
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            status: "confirmed",
            payment_status: "paid",
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", session.metadata.orderNumber);

        if (orderError) {
          console.error("Error updating order:", orderError);
          throw orderError;
        }

        // Create detailed payment record
        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: parseInt(session.metadata.orderId),
          payment_intent_id: session.payment_intent,
          session_id: session.id,
          provider: "stripe",
          method: methodType,
          method_details: methodDetails,
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          status: "succeeded",
          customer_email: session.customer_email,
          customer_name: session.metadata.customerName,
          billing_address: session.customer_details?.address
            ? {
                line1: session.customer_details.address.line1,
                line2: session.customer_details.address.line2,
                city: session.customer_details.address.city,
                postal_code: session.customer_details.address.postal_code,
                country: session.customer_details.address.country,
                state: session.customer_details.address.state,
              }
            : null,
          created_at: new Date().toISOString(),
        });

        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
          throw paymentError;
        }

        // Update inventory for purchased items
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", session.metadata.orderId);

        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            await supabase.rpc("decrease_product_stock", {
              product_id: item.product_id,
              quantity: item.quantity,
            });
          }
        }

        // Log successful payment for analytics
        await supabase.from("payment_analytics").insert({
          order_number: session.metadata.orderNumber,
          payment_method: methodType,
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          customer_country:
            session.customer_details?.address?.country || "unknown",
          success: true,
          processed_at: new Date().toISOString(),
        });

        console.log(
          `Payment successful for order ${session.metadata.orderNumber} using ${methodType}`
        );
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;

        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "failed",
            failure_reason:
              failedPayment.last_payment_error?.message || "Payment failed",
            failure_code: failedPayment.last_payment_error?.code,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_intent_id", failedPayment.id);

        // Update order status
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "payment_failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", failedPayment.id);

        // Log failed payment for analytics
        await supabase.from("payment_analytics").insert({
          payment_intent_id: failedPayment.id,
          payment_method: failedPayment.payment_method?.type || "unknown",
          amount: failedPayment.amount / 100,
          currency: failedPayment.currency.toUpperCase(),
          success: false,
          failure_reason: failedPayment.last_payment_error?.message,
          processed_at: new Date().toISOString(),
        });

        console.log(`Payment failed for payment intent ${failedPayment.id}`);
        break;

      case "payment_method.attached":
        // Handle payment method attachment (useful for saving customer payment methods)
        const attachedPaymentMethod = event.data.object;
        console.log(
          `Payment method ${attachedPaymentMethod.id} attached to customer`
        );
        break;

      case "charge.dispute.created":
        // Handle chargebacks/disputes
        const dispute = event.data.object;

        // Find the order associated with this charge
        const { data: disputedOrder } = await supabase
          .from("payments")
          .select("order_id")
          .eq("payment_intent_id", dispute.payment_intent)
          .single();

        if (disputedOrder) {
          // Update order status to disputed
          await supabase
            .from("orders")
            .update({
              status: "disputed",
              dispute_reason: dispute.reason,
              dispute_amount: dispute.amount / 100,
              updated_at: new Date().toISOString(),
            })
            .eq("id", disputedOrder.order_id);

          // Log dispute for admin review
          await supabase.from("order_disputes").insert({
            order_id: disputedOrder.order_id,
            stripe_dispute_id: dispute.id,
            reason: dispute.reason,
            amount: dispute.amount / 100,
            currency: dispute.currency.toUpperCase(),
            status: dispute.status,
            created_at: new Date().toISOString(),
          });
        }

        console.log(
          `Dispute created for charge ${dispute.charge}: ${dispute.reason}`
        );
        break;

      case "invoice.payment_succeeded":
        // Handle successful subscription payments (if you add subscriptions later)
        const invoice = event.data.object;
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        break;

      case "customer.subscription.created":
        // Handle new subscriptions (for future subscription products)
        const subscription = event.data.object;
        console.log(`New subscription created: ${subscription.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({
      received: true,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Log the error for debugging
    await supabase
      .from("webhook_errors")
      .insert({
        event_id: event.id,
        event_type: event.type,
        error_message: error.message,
        error_stack: error.stack,
        created_at: new Date().toISOString(),
      })
      .catch(console.error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        event_type: event.type,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Stripe webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
