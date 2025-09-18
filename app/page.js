"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import {
  Star,
  Sparkles,
  Award,
  Users,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!products_category_id_fkey(name, slug),
          product_images(image_url, alt_text, is_primary)
        `
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching featured products:", error);
        // Set fallback data if database fails
        setFeaturedProducts([]);
      } else {
        // Transform data to match ProductCard expectations
        const transformedProducts = (data || []).map((product) => ({
          ...product,
          images: product.product_images?.map((img) => img.image_url) || [],
          originalPrice: product.original_price,
          isNew: product.is_new,
          sale: product.is_sale,
        }));
        setFeaturedProducts(transformedProducts);
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "100% Virgin Hair",
      description:
        "Premium quality human hair sourced ethically from around the world",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Luxury Experience",
      description:
        "White-glove service with premium packaging and fast delivery",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "2K+ Happy Customers",
      description:
        "Join thousands of satisfied customers who trust Dimplesluxe",
    },
  ];

  const testimonials = [
    {
      name: "Aisha Thompson",
      rating: 5,
      comment:
        "Absolutely love my Brazilian straight bundles! The quality is incredible and it blends perfectly with my natural hair.",
      image:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Nia Okonkwo",
      rating: 5,
      comment:
        "Best hair extensions I've ever purchased. The curls are so defined and bouncy. Will definitely order again!",
      image:
        "https://images.unsplash.com/photo-1658497730270-b5f4fef00ae1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjB3b21hbiUyMHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
    {
      name: "Zuri Davis",
      rating: 5,
      comment:
        "The customer service is amazing and the hair quality is top-notch. Fast shipping and beautiful packaging too!",
      image:
        "https://images.unsplash.com/photo-1656473031961-9d5d9ee19f40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxhY2slMjB3b21hbiUyMHBvcnRyYWl0fGVufDB8fDB8fHww",
    },
  ];

  return (
    <div className="min-h-screen ">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white md:px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">Dimplesluxe</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
              Experience the difference that premium quality and exceptional
              service can make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 sm:p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-luxury transition-all duration-300"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 md:px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="gradient-text">Products</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
              Discover our most popular premium hair bundles and extensions
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 shadow-lg animate-pulse"
                >
                  <div className="h-48 sm:h-64 lg:h-80 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Featured Products
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for our latest featured items
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href="/products"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>View All Products</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white md:px-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
              Real reviews from real customers who love their Dimplesluxe hair
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-luxury hover:shadow-hover transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
                  "{testimonial.comment}"
                </p>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Verified Customer
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 luxury-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied customers and experience the
              Dimplesluxe difference today
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="/products"
                className="bg-white text-primary-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Shop Now
              </a>
              <a
                href="/about"
                className="border-2 border-white text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white hover:text-primary-600 transition-colors text-sm sm:text-base"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
