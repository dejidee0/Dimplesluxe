"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  CheckCircle,
  Package,
  Truck,
  MessageCircle,
  Download,
  Calendar,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/currency";
import { redirectToWhatsApp } from "../../lib/whatsapp";
import toast from "react-hot-toast";

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.orderNumber) {
      fetchOrderDetails();
    }
  }, [params.orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", params.orderNumber)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id);

      if (itemsError) throw itemsError;

      setOrder(orderData);
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Order not found");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!order) return;

    const orderDetails = {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      address: order.shipping_address_line1,
      city: order.shipping_city,
      postcode: order.shipping_postcode,
      country: order.shipping_country,
      items: orderItems.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: formatPrice(item.total_price, order.currency),
      })),
      total: formatPrice(order.total, order.currency),
      paymentMethod: "Card Payment",
    };

    redirectToWhatsApp(orderDetails);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find an order with that number.
            </p>
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 inline-block">
              <div className="text-sm text-gray-600 mb-1">Order Number</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                #{order.order_number}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {item.product_name}
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                          {item.selected_length && (
                            <p>Length: {item.selected_length}"</p>
                          )}

                          {item.selected_color && (
                            <p>Color: {item.selected_color}</p>
                          )}
                          <p>Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {formatPrice(item.total_price, order.currency)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {formatPrice(item.unit_price, order.currency)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
                      Delivery Address
                    </h3>
                    <div className="text-sm sm:text-base text-gray-600 space-y-1">
                      <p>{order.customer_name}</p>
                      <p>{order.shipping_address_line1}</p>
                      {order.shipping_address_line2 && (
                        <p>{order.shipping_address_line2}</p>
                      )}

                      <p>
                        {order.shipping_city}, {order.shipping_postcode}
                      </p>
                      <p>{order.shipping_country}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
                      Shipping Method
                    </h3>
                    <div className="text-sm sm:text-base text-gray-600">
                      <p className="capitalize">
                        {order.shipping_method} Delivery
                      </p>
                      <p>3-5 business days</p>
                      {order.tracking_number && (
                        <p className="mt-2">
                          <span className="font-medium">Tracking:</span>{" "}
                          {order.tracking_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Order Status
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Order Confirmed
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-600">
                        Processing
                      </div>
                      <div className="text-sm text-gray-500">
                        We're preparing your order
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-600">Shipped</div>
                      <div className="text-sm text-gray-500">
                        Your order is on its way
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal, order.currency)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Shipping</span>
                    <span>
                      {order.shipping_cost === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        formatPrice(order.shipping_cost, order.currency)
                      )}
                    </span>
                  </div>

                  {order.tax > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                      <span>Tax</span>
                      <span>{formatPrice(order.tax, order.currency)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-lg sm:text-xl text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(order.total, order.currency)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-500 text-white font-semibold px-4 py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Contact via WhatsApp</span>
                  </button>

                  <button className="w-full btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Download Receipt</span>
                  </button>

                  <Link
                    href="/products"
                    className="w-full btn-primary text-center block text-sm sm:text-base"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Contact Information */}
                <div className="mt-6 pt-6 border-t text-center">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Need Help?
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>Email: hello@dimplesluxe.com</p>
                    <p>Phone: +44 7123 456789</p>
                    <p>Mon-Fri: 9AM-6PM GMT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
