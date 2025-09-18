"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Heart, Award, Users, Globe, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description:
        "We source only the finest 100% virgin human hair from ethical suppliers worldwide.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We provide exceptional service and support.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description:
        "Serving customers worldwide with fast, reliable shipping and local payment options.",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation",
      description:
        "Constantly evolving our products and services to exceed your expectations.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description: "Dimplesluxe was born from a passion for premium hair",
    },
    {
      year: "2021",
      title: "First 500 Customers",
      description: "Reached our first major milestone",
    },
    {
      year: "2022",
      title: "International Expansion",
      description: "Expanded to serve customers globally",
    },
    {
      year: "2023",
      title: "1K+ Happy Customers",
      description: "Celebrating over 1,000 satisfied customers",
    },
    {
      year: "2024",
      title: "Premium Platform",
      description: "Launched our new luxury e-commerce experience",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our Story of <span className="gradient-text">Beauty</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8">
                At Dimplesluxe, we believe every woman deserves to feel
                confident and beautiful. Our journey began with a simple
                mission: to provide premium, ethically-sourced human hair that
                enhances your natural beauty.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                    2K+
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">
                    Happy Customers
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                    5★
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">
                    Average Rating
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                    5+
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">
                    Countries Served
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              These core values guide everything we do and shape the Dimplesluxe
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 sm:p-6 rounded-2xl bg-white shadow-lg hover:shadow-hover transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary-600">
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              From humble beginnings to becoming a trusted name in premium hair
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col sm:flex-row items-center mb-8 sm:mb-12 ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                <div className="flex-1 p-4 sm:p-6 mb-4 sm:mb-0">
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="text-primary-600 font-bold text-xl sm:text-2xl mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center mx-4 sm:mx-8 flex-shrink-0">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-current" />
                </div>
                <div className="flex-1 hidden sm:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 luxury-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Join the Dimplesluxe Family
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the difference that premium quality and exceptional
              service can make. Your hair transformation journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-white text-primary-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base">
                Shop Now
              </button>
              <button className="border-2 border-white text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white hover:text-primary-600 transition-colors text-sm sm:text-base">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
