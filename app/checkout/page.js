"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  Smartphone,
  Building2,
  Lock,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useAuthStore } from "../../lib/store";
import { formatPrice } from "../../lib/currency";
import { supabase } from "../../lib/supabase";
import { initializePayPalPayment } from "../../lib/payments/paypal";
import { initializePaystackPayment } from "../../lib/payments/paystack";
import {
  initializeApplePay,
  isApplePayAvailable,
} from "../../lib/payments/applepay";
import { fetchLiveExchangeRate } from "../../lib/exchangeRates";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { query = {} } = router; // Default to empty object to prevent undefined
  const { user, loading: userLoading } = useAuthStore();
  const {
    items,
    getTotal,
    clearCart,
    currency,
    exchangeRate,
    setCurrency,
    setExchangeRate,
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    billingAddress: "",
    billingAddress2: "",
    billingCity: "",
    billingPostcode: "",
    billingCountry: "GB",
    sameAsBilling: true,
    shippingAddress: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingPostcode: "",
    shippingCountry: "GB",
    shippingMethod: "standard",
    paymentMethod: "paypal",
  });
  const [errors, setErrors] = useState({});

  // Handle cancelled payment and move to payment step
  useEffect(() => {
    if (query.cancelled === "true") {
      toast.error(
        "Payment was cancelled. Please try again or choose another payment method."
      );
      setCurrentStep(4); // Move to payment step for retry
    }
  }, [query]);

  // Handle successful payment callback
  useEffect(() => {
    if (query.success === "true" && query.orderId && query.orderNumber) {
      const confirmOrder = async () => {
        try {
          // Verify order exists and is pending
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", query.orderId)
            .eq("order_number", query.orderNumber)
            .eq("status", "pending")
            .single();

          if (orderError || !order) {
            throw new Error("Invalid or already processed order");
          }

          // Update order status to completed
          const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "completed" })
            .eq("id", query.orderId);

          if (updateError) {
            throw new Error(`Failed to confirm order: ${updateError.message}`);
          }

          clearCart();
          toast.success("Order placed successfully!");
          router.push(`/order-confirmation/${query.orderNumber}`);
        } catch (error) {
          console.error("Order confirmation error:", error);
          toast.error("Failed to confirm order. Please contact support.");
        }
      };
      confirmOrder();
    }
  }, [query, clearCart, router]);

  useEffect(() => {
    if (user && !userLoading) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
      }));
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  useEffect(() => {
    updateAvailablePaymentMethods();
  }, [currency, formData.billingCountry]);

  useEffect(() => {
    const updateCurrency = async () => {
      try {
        if (formData.billingCountry === "NG") {
          setCurrency("NGN");
          const rate = await fetchLiveExchangeRate("GBP", "NGN");
          setExchangeRate(rate);
          setFormData((prev) => ({ ...prev, paymentMethod: "paystack" }));
        } else {
          setCurrency("GBP");
          setExchangeRate(1);
          if (formData.paymentMethod === "paystack") {
            setFormData((prev) => ({ ...prev, paymentMethod: "paypal" }));
          }
        }
      } catch (error) {
        console.error("Error updating currency:", error);
        toast.error("Failed to update currency rate");
        setExchangeRate(formData.billingCountry === "NG" ? 1850 : 1);
      }
    };
    updateCurrency();
  }, [formData.billingCountry, setCurrency, setExchangeRate]);

  const updateAvailablePaymentMethods = () => {
    const methods = [];
    if (currency !== "NGN" || formData.billingCountry !== "NG") {
      methods.push({
        id: "paypal",
        name: "PayPal",
        description: "Pay with PayPal, credit/debit card, or bank account",
        icon: Wallet,
        currencies: ["GBP", "USD", "EUR", "CAD", "AUD"],
      });
    }
    if (currency === "NGN" || formData.billingCountry === "NG") {
      methods.push({
        id: "paystack",
        name: "Paystack",
        description: "Bank transfer, Card, USSD, Mobile Money",
        icon: Building2,
        currencies: ["NGN"],
      });
    }
    if (isApplePayAvailable() && currency !== "NGN") {
      methods.push({
        id: "apple_pay",
        name: "Apple Pay",
        description: "Pay with Touch ID or Face ID",
        icon: Smartphone,
        currencies: ["GBP", "USD", "EUR", "CAD", "AUD"],
      });
    }
    setAvailablePaymentMethods(methods);
    const currentMethodAvailable = methods.some(
      (method) => method.id === formData.paymentMethod
    );
    if (!currentMethodAvailable && methods.length > 0) {
      setFormData((prev) => ({ ...prev, paymentMethod: methods[0].id }));
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      if (newCurrency === "NGN") {
        const rate = await fetchLiveExchangeRate("GBP", "NGN");
        setExchangeRate(rate);
      } else {
        setExchangeRate(1);
      }
      toast.success(`Currency switched to ${newCurrency}`);
    } catch (error) {
      console.error("Error switching currency:", error);
      toast.error("Failed to switch currency");
      setExchangeRate(newCurrency === "NGN" ? 1850 : 1);
    }
  };

  const subtotal = getTotal();
  const shippingCost =
    formData.shippingMethod === "express" ? 9.99 : subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  // Validate total to prevent invalid amounts
  if (total <= 0) {
    console.error("Invalid total amount:", total);
    toast.error("Order total must be greater than zero");
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
    }
    if (step === 2) {
      if (!formData.billingAddress)
        newErrors.billingAddress = "Address is required";
      if (!formData.billingCity) newErrors.billingCity = "City is required";
      if (!formData.billingPostcode)
        newErrors.billingPostcode = "Postcode is required";
      if (!formData.sameAsBilling) {
        if (!formData.shippingAddress)
          newErrors.shippingAddress = "Shipping address is required";
        if (!formData.shippingCity)
          newErrors.shippingCity = "Shipping city is required";
        if (!formData.shippingPostcode)
          newErrors.shippingPostcode = "Shipping postcode is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const createOrder = async () => {
    try {
      // Ensure Supabase client uses user session if authenticated
      if (user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          supabase.auth.setSession(session.access_token);
        }
      }

      const orderNumber = `DLX${Date.now()}`;
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        total,
        currency,
        exchange_rate: exchangeRate,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        billing_address_line1: formData.billingAddress,
        billing_address_line2: formData.billingAddress2,
        billing_city: formData.billingCity,
        billing_postcode: formData.billingPostcode,
        billing_country: formData.billingCountry,
        shipping_address_line1: formData.sameAsBilling
          ? formData.billingAddress
          : formData.shippingAddress,
        shipping_address_line2: formData.sameAsBilling
          ? formData.billingAddress2
          : formData.shippingAddress2,
        shipping_city: formData.sameAsBilling
          ? formData.billingCity
          : formData.shippingCity,
        shipping_postcode: formData.sameAsBilling
          ? formData.billingPostcode
          : formData.shippingPostcode,
        shipping_country: formData.sameAsBilling
          ? formData.billingCountry
          : formData.shippingCountry,
        shipping_method: formData.shippingMethod,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error("Supabase order insert error:", error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_slug: item.slug,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        selected_length: item.selectedLength || null,
        selected_color: item.selectedColor || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Supabase order_items insert error:", itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      return order;
    } catch (error) {
      console.error("Order creation error:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    try {
      const order = await createOrder();
      const paymentData = {
        orderId: order.id,
        orderNumber: order.order_number,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        total,
        currency,
        items: items.map((item) => ({
          name: item.name,
          description: item.short_description || "",
          price: item.price,
          quantity: item.quantity,
          images: item.images || [],
        })),
        shipping: shippingCost,
        shippingMethod: formData.shippingMethod,
        successUrl: `${window.location.origin}/checkout?success=true&orderId=${order.id}&orderNumber=${order.order_number}`,
        cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
      };

      switch (formData.paymentMethod) {
        case "paypal":
          await initializePayPalPayment(paymentData);
          break;
        case "paystack":
          await initializePaystackPayment(paymentData);
          break;
        case "apple_pay":
          if (isApplePayAvailable()) {
            await initializeApplePay(paymentData);
          } else {
            toast.error("Apple Pay is not available on this device");
            return;
          }
          break;
        default:
          throw new Error("Invalid payment method");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    setErrors({});
    setCurrentStep(4); // Stay on payment step
    toast.dismiss(); // Clear toasts
  };

  const handleReturnToCart = () => {
    router.push("/cart");
  };

  const steps = [
    { number: 1, title: "Contact Info", description: "Your details" },
    { number: 2, title: "Addresses", description: "Billing & shipping" },
    { number: 3, title: "Shipping", description: "Delivery method" },
    { number: 4, title: "Payment", description: "Complete order" },
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Checkout
          </h1>
          {query.cancelled === "true" && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">
                  Your payment was cancelled. Please try again or choose another
                  payment method.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRetryPayment}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Retry Payment
                </button>
                <button
                  onClick={handleReturnToCart}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Return to Cart
                </button>
              </div>
            </div>
          )}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Currency</h3>
                <p className="text-sm text-gray-600">
                  Choose your preferred currency
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCurrencyChange("GBP")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currency === "GBP"
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  £ GBP
                </button>
                <button
                  onClick={() => handleCurrencyChange("NGN")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currency === "NGN"
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ₦ NGN
                </button>
              </div>
            </div>
            {currency === "NGN" && (
              <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <strong>Nigerian customers:</strong> Paystack offers the best
                rates and local payment methods including bank transfer, USSD,
                and mobile money.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between max-w-2xl">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.number
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-sm sm:text-base font-medium">
                      {step.number}
                    </span>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      currentStep > step.number
                        ? "bg-primary-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                        Contact Information
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                              errors.firstName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                              errors.lastName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                        Addresses
                      </h2>
                      <div className="mb-6 sm:mb-8">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                          Billing Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address *
                            </label>
                            <input
                              type="text"
                              value={formData.billingAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "billingAddress",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                                errors.billingAddress
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.billingAddress && (
                              <p className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.billingAddress}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              value={formData.billingAddress2}
                              onChange={(e) =>
                                handleInputChange(
                                  "billingAddress2",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              value={formData.billingCity}
                              onChange={(e) =>
                                handleInputChange("billingCity", e.target.value)
                              }
                              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                                errors.billingCity
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.billingCity && (
                              <p className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.billingCity}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postcode *
                            </label>
                            <input
                              type="text"
                              value={formData.billingPostcode}
                              onChange={(e) =>
                                handleInputChange(
                                  "billingPostcode",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                                errors.billingPostcode
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors.billingPostcode && (
                              <p className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.billingPostcode}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country *
                            </label>
                            <select
                              value={formData.billingCountry}
                              onChange={(e) =>
                                handleInputChange(
                                  "billingCountry",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                            >
                              <option value="GB">United Kingdom</option>
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="AU">Australia</option>
                              <option value="NG">Nigeria</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.sameAsBilling}
                            onChange={(e) =>
                              handleInputChange(
                                "sameAsBilling",
                                e.target.checked
                              )
                            }
                            className="text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm sm:text-base text-gray-700">
                            Shipping address is the same as billing address
                          </span>
                        </label>
                      </div>
                      {!formData.sameAsBilling && (
                        <div>
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                            Shipping Address
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                              </label>
                              <input
                                type="text"
                                value={formData.shippingAddress}
                                onChange={(e) =>
                                  handleInputChange(
                                    "shippingAddress",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                                  errors.shippingAddress
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.shippingAddress && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">
                                  {errors.shippingAddress}
                                </p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address Line 2
                              </label>
                              <input
                                type="text"
                                value={formData.shippingAddress2}
                                onChange={(e) =>
                                  handleInputChange(
                                    "shippingAddress2",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                value={formData.shippingCity}
                                onChange={(e) =>
                                  handleInputChange(
                                    "shippingCity",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                                  errors.shippingCity
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.shippingCity && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">
                                  {errors.shippingCity}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postcode *
                              </label>
                              <input
                                type="text"
                                value={formData.shippingPostcode}
                                onChange={(e) =>
                                  handleInputChange(
                                    "shippingPostcode",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base ${
                                  errors.shippingPostcode
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.shippingPostcode && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">
                                  {errors.shippingPostcode}
                                </p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                              </label>
                              <select
                                value={formData.shippingCountry}
                                onChange={(e) =>
                                  handleInputChange(
                                    "shippingCountry",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                              >
                                <option value="GB">United Kingdom</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="AU">Australia</option>
                                <option value="NG">Nigeria</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                        Shipping Method
                      </h2>
                      <div className="space-y-4">
                        <label className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shipping"
                            value="standard"
                            checked={formData.shippingMethod === "standard"}
                            onChange={(e) =>
                              handleInputChange(
                                "shippingMethod",
                                e.target.value
                              )
                            }
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-sm sm:text-base">
                                  Standard Delivery
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  3-5 business days
                                </div>
                              </div>
                              <div className="font-medium text-sm sm:text-base">
                                {subtotal > 50
                                  ? "Free"
                                  : formatPrice(4.99, currency, exchangeRate)}
                              </div>
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="shipping"
                            value="express"
                            checked={formData.shippingMethod === "express"}
                            onChange={(e) =>
                              handleInputChange(
                                "shippingMethod",
                                e.target.value
                              )
                            }
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-sm sm:text-base">
                                  Express Delivery
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  1-2 business days
                                </div>
                              </div>
                              <div className="font-medium text-sm sm:text-base">
                                {formatPrice(9.99, currency, exchangeRate)}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                      <div className="mt-6 flex items-center space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          All orders are fully tracked and insured for your
                          peace of mind.
                        </span>
                      </div>
                    </div>
                  )}
                  {currentStep === 4 && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                        Payment Method
                      </h2>
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-blue-900">
                            Payment in{" "}
                            {currency === "NGN"
                              ? "Nigerian Naira (₦)"
                              : "British Pounds (£)"}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {currency === "NGN"
                            ? "Paystack offers the best rates for Nigerian customers with local payment methods."
                            : "International payment methods available for global customers."}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {availablePaymentMethods.map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <label
                              key={method.id}
                              className="flex items-center p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={formData.paymentMethod === method.id}
                                onChange={(e) =>
                                  handleInputChange(
                                    "paymentMethod",
                                    e.target.value
                                  )
                                }
                                className="text-primary-600 focus:ring-primary-500"
                              />
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 ml-3" />
                              <div className="ml-3 flex-1">
                                <div className="font-medium text-sm sm:text-base">
                                  {method.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {method.description}
                                </div>
                                {method.id === "paystack" &&
                                  currency === "NGN" && (
                                    <div className="text-xs text-green-600 mt-1">
                                      ✓ Best for Nigerian customers
                                    </div>
                                  )}
                              </div>
                            </label>
                          );
                        })}
                        {availablePaymentMethods.length === 0 && (
                          <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              No Payment Methods Available
                            </h3>
                            <p className="text-gray-600">
                              Please select a different currency or country.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 flex items-center space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Your payment information is encrypted and secure. We
                          never store your card details.
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 border-t space-y-3 sm:space-y-0">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="btn-primary order-1 sm:order-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 order-1 sm:order-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <Lock className="w-4 h-4" />
                    <span>
                      {loading
                        ? "Processing..."
                        : `Pay ${formatPrice(total, currency, exchangeRate)}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-32">
              <h2 className="font-semibold text-lg sm:text-xl text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.images?.[0] ||
                          "https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800"
                        }
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">
                        {item.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {item.selectedLength && `${item.selectedLength}" • `}
                        {item.selectedColor}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-900">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 text-xs sm:text-sm">
                      {formatPrice(
                        item.price * item.quantity,
                        currency,
                        exchangeRate
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency, exchangeRate)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shippingCost, currency, exchangeRate)
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between font-semibold text-base sm:text-lg text-gray-900 border-t pt-3">
                <span>Total</span>
                <span>{formatPrice(total, currency, exchangeRate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
