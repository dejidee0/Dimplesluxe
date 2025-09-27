"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  ArrowRight,
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
  const [isClient, setIsClient] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);

  const searchInputRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const { getItemCount } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeAll } = useUIStore();
  const { user } = useAuthStore();

  const itemCount = isClient ? getItemCount() : 0;

  useEffect(() => {
    setIsClient(true);

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        if (error) throw error;

        const structuredCategories = [
          { name: "All Products", href: "/products", subcategories: [] },
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
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        closeAll();
      }
      if (window.innerWidth >= 768 && showMobileSearch) {
        setShowMobileSearch(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen, showMobileSearch, closeAll]);

  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowMobileSearch(false);
      closeAll();
    }
  };

  const handleMobileMenuToggle = () => {
    if (showMobileSearch) {
      setShowMobileSearch(false);
    }
    toggleMobileMenu();
  };

  const handleMobileSearchToggle = () => {
    if (isMobileMenuOpen) {
      closeAll();
    }
    setShowMobileSearch(!showMobileSearch);
  };

  const closeMobileMenu = () => {
    closeAll();
    setExpandedMobileCategory(null);
  };

  const toggleMobileCategory = (categoryName) => {
    setExpandedMobileCategory(
      expandedMobileCategory === categoryName ? null : categoryName
    );
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (!isClient) {
    return <NavbarSkeleton />;
  }

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white shadow-sm"
        }`}
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-2 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">
                  🚚 Free UK delivery on orders over £50
                </span>
                <span className="sm:hidden">🚚 Free delivery over £50</span>
              </motion.p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg sm:text-xl">
                  D
                </span>
              </motion.div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Dimplesluxe
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(category.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={category.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-pink-500 font-medium transition-colors duration-200 py-2"
                  >
                    <span>{category.name}</span>
                    {category.subcategories.length > 0 && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {category.subcategories.length > 0 && (
                    <AnimatePresence>
                      {activeDropdown === category.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden"
                        >
                          <div className="py-2">
                            {category.subcategories.map((sub, index) => (
                              <motion.div
                                key={sub.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  href={sub.href}
                                  className="block px-4 py-3 text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-colors duration-200 flex items-center justify-between group"
                                >
                                  <span>{sub.name}</span>
                                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2.5 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-pink-500 focus-within:bg-white transition-all duration-200"
            >
              <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for premium hair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
            </form>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Search Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleMobileSearchToggle}
                className={`md:hidden p-2 rounded-full transition-colors duration-200 ${
                  showMobileSearch
                    ? "bg-pink-500 text-white"
                    : "text-gray-700 hover:text-pink-500 hover:bg-gray-100"
                }`}
              >
                {showMobileSearch ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </motion.button>

              {/* Wishlist */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  href="/wishlist"
                  className="p-2 text-gray-700 hover:text-pink-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 hover:text-pink-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                      >
                        {itemCount > 99 ? "99+" : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* User Account */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  href={user ? "/account" : "/auth/login"}
                  className="p-2 text-gray-700 hover:text-pink-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleMobileMenuToggle}
                className={`lg:hidden p-2 rounded-full transition-colors duration-200 ${
                  isMobileMenuOpen
                    ? "bg-pink-500 text-white"
                    : "text-gray-700 hover:text-pink-500 hover:bg-gray-100"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6">
                  <nav className="space-y-2 px-6">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {category.subcategories.length > 0 ? (
                          <>
                            <button
                              onClick={() =>
                                toggleMobileCategory(category.name)
                              }
                              className="w-full flex items-center justify-between py-3 text-gray-700 hover:text-pink-500 font-medium transition-colors text-left"
                            >
                              <span>{category.name}</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  expandedMobileCategory === category.name
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {expandedMobileCategory === category.name && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 space-y-2 py-2">
                                    <Link
                                      href={category.href}
                                      onClick={closeMobileMenu}
                                      className="block py-2 text-gray-600 hover:text-pink-500 transition-colors"
                                    >
                                      View All {category.name}
                                    </Link>
                                    {category.subcategories.map(
                                      (sub, subIndex) => (
                                        <motion.div
                                          key={sub.name}
                                          initial={{ opacity: 0, x: 10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            delay: subIndex * 0.05,
                                          }}
                                        >
                                          <Link
                                            href={sub.href}
                                            onClick={closeMobileMenu}
                                            className="block py-2 text-gray-600 hover:text-pink-500 transition-colors"
                                          >
                                            {sub.name}
                                          </Link>
                                        </motion.div>
                                      )
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            href={category.href}
                            onClick={closeMobileMenu}
                            className="block py-3 text-gray-700 hover:text-pink-500 font-medium transition-colors"
                          >
                            {category.name}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </nav>

                  {/* Additional Links */}
                  <div className="border-t border-gray-200 mt-6 pt-6 px-6 space-y-2">
                    <Link
                      href="/about"
                      onClick={closeMobileMenu}
                      className="block py-3 text-gray-700 hover:text-pink-500 font-medium transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      onClick={closeMobileMenu}
                      className="block py-3 text-gray-700 hover:text-pink-500 font-medium transition-colors"
                    >
                      Contact
                    </Link>
                    <Link
                      href="/help"
                      onClick={closeMobileMenu}
                      className="block py-3 text-gray-700 hover:text-pink-500 font-medium transition-colors"
                    >
                      Help & Support
                    </Link>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                  {user ? (
                    <div className="space-y-3">
                      <Link
                        href="/account"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          My Account
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/auth/login"
                        onClick={closeMobileMenu}
                        className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={closeMobileMenu}
                        className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-20 sm:h-22" />
    </>
  );
}

// Skeleton component for SSR
function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="h-4 bg-pink-400 rounded w-48 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-5 bg-gray-200 rounded w-20 animate-pulse"
              />
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:block w-64 lg:w-80 h-10 bg-gray-200 rounded-full animate-pulse" />

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="h-20 sm:h-22" />
    </nav>
  );
}
