"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Send,
  CheckCircle,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 2000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full luxury-gradient flex items-center justify-center shadow-lg">
                <span className="text-white font-playfair font-bold">D</span>
              </div>
              <span className="font-playfair text-xl font-bold text-white">
                Dimplesluxe
              </span>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base leading-relaxed">
              Premium human hair bundles and extensions. Quality guaranteed,
              luxury delivered.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-pink-400 hover:bg-gray-700 transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-gray-700 transition-all duration-300"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-primary-400 rounded-full" />
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="group flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <div className="w-1 h-1 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="group flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <div className="w-1 h-1 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 relative">
              Customer Service
              <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-primary-400 rounded-full" />
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="group flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <div className="w-1 h-1 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="group flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <div className="w-1 h-1 bg-primary-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-primary-400 rounded-full" />
            </h3>
            <div className="space-y-4 mb-6">
              <a
                href="mailto:dimplesluxe@gmail.com"
                className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800/50"
              >
                <div className="p-2 bg-primary-500/10 rounded-lg group-hover:bg-primary-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-sm">dimplesluxe@gmail.com</span>
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-2" />
                Stay Updated
              </h4>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-white placeholder-gray-400 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="w-full bg-primary-500 px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Dimplesluxe. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              Made with{" "}
              <Heart className="w-4 h-4 text-red-400 mx-2 animate-pulse" /> for
              beautiful hair
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
