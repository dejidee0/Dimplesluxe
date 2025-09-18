"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useCartStore, useUIStore, useAuthStore } from "../../lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);

  const { getItemCount } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeAll } = useUIStore();
  const { user } = useAuthStore();
  const { currency, setCurrency, fetchExchangeRate } = useCartStore();

  const itemCount = getItemCount();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        if (error) throw error;

        // Structure categories with subcategories
        const structuredCategories = [
          { name: "All", href: "/products", subcategories: [] },
          ...data
            .filter((cat) => !cat.parent_id)
            .map((cat) => ({
              name: cat.name,
              href: `/products?category=${cat.slug}`,
              subcategories: data
                .filter((sub) => sub.parent_id === cat.id)
                .map((sub) => ({
                  name: sub.name,
                  href: `/products?subcategory=${sub.slug}`,
                })),
            })),
        ];
        setCategories(structuredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      closeAll();
    }
  };
  const handleCurrencyToggle = async () => {
    const newCurrency = currency === "GBP" ? "NGN" : "GBP";
    setCurrency(newCurrency);
    if (newCurrency === "NGN") {
      await fetchExchangeRate("GBP", "NGN");
    }
  };
  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary-500 to-rose-500 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden sm:inline">
                  Free UK delivery on orders over £50
                </span>
                <span className="sm:hidden">Free delivery over £50</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">+44 7123 456789</span>
                <span className="sm:hidden">Call Us</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full luxury-gradient flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-lg sm:text-xl">
                  D
                </span>
              </div>
              <span className="font-playfair text-xl sm:text-2xl font-bold gradient-text">
                Dimplesluxe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(category.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={category.href}
                    className="text-gray-700 hover:text-primary-500 font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>{category.name}</span>
                    {category.subcategories.length > 0 && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Link>
                  {category.subcategories.length > 0 && (
                    <div
                      className={`absolute top-full left-0 mt-2 w-48 bg-white shadow-luxury rounded-lg transition-all duration-300 ${
                        activeDropdown === category.name
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                    >
                      <div className="py-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-4 py-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 lg:w-80"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search for premium hair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
            </form>

            {/* Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                className="md:hidden text-gray-700 hover:text-primary-500 p-1"
                onClick={() => router.push("/search")}
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <Link
                href="/wishlist"
                className="text-gray-700 hover:text-primary-500 transition-colors p-1"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link
                href="/cart"
                className="relative text-gray-700 hover:text-primary-500 transition-colors p-1"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center ">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
              <Link
                href={user ? "/account" : "/auth/login"}
                className="text-gray-700 hover:text-primary-500 transition-colors p-1"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <button
                onClick={handleCurrencyToggle}
                className="text-gray-700 hover:text-primary-500 transition-colors p-1 text-xs sm:text-sm font-medium"
                title={`Switch to ${currency === "GBP" ? "NGN" : "GBP"}`}
              >
                {currency === "GBP" ? "₦" : "£"}
              </button>
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-700 hover:text-primary-500 p-1"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 sm:top-24 left-0 right-0 bg-white shadow-luxury z-40 lg:hidden max-h-screen overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-6">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </form>
              <nav className="space-y-4">
                {categories.map((category) => (
                  <div key={category.name}>
                    <Link
                      href={category.href}
                      onClick={() => toggleMobileMenu()}
                      className="block text-gray-700 font-medium py-2 hover:text-primary-500 text-lg"
                    >
                      {category.name}
                    </Link>
                    {category.subcategories.length > 0 && (
                      <div className="ml-4 space-y-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => toggleMobileMenu()}
                            className="block text-gray-600 py-1 hover:text-primary-500"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t pt-4 mt-6 space-y-4">
                  <Link
                    href="/about"
                    onClick={() => toggleMobileMenu()}
                    className="block text-gray-700 font-medium py-2 hover:text-primary-500"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => toggleMobileMenu()}
                    className="block text-gray-700 font-medium py-2 hover:text-primary-500"
                  >
                    Contact
                  </Link>
                  {!user && (
                    <Link
                      href="/auth/login"
                      onClick={() => toggleMobileMenu()}
                      className="block bg-primary-500 text-white text-center py-3 rounded-lg font-medium"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-24 sm:h-28 lg:h-32"></div>
    </>
  );
}
