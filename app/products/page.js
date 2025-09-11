"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { Filter, Grid, List, SlidersHorizontal, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useFilterStore } from "../../lib/store";
import { toast } from "react-hot-toast";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { filters, setFilters, clearFilters } = useFilterStore();

  const priceRanges = [
    { label: "Under £50", min: 0, max: 50 },
    { label: "£50 - £100", min: 50, max: 100 },
    { label: "£100 - £200", min: 100, max: 200 },
    { label: "Over £200", min: 200, max: 999999 },
  ];

  const lengths = ['14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"'];
  const colors = [
    "Natural Black",
    "Dark Brown",
    "Medium Brown",
    "Light Brown",
    "Honey Blonde",
    "Blonde",
  ];
  const textures = [
    "Straight",
    "Body Wave",
    "Loose Wave",
    "Deep Wave",
    "Kinky Curly",
    "Kinky Twist",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        if (error) throw error;
        setCategories(data || []);

        // Initialize filters from URL
        const categorySlug = searchParams.get("category");
        const subcategorySlug = searchParams.get("subcategory");
        const newFilters = {};
        if (categorySlug) {
          const category = data.find((cat) => cat.slug === categorySlug);
          if (category) newFilters.category = category.id;
        }
        if (subcategorySlug) {
          const subcategory = data.find((cat) => cat.slug === subcategorySlug);
          if (subcategory) newFilters.subcategory = subcategory.id;
        }
        if (Object.keys(newFilters).length > 0) {
          setFilters(newFilters);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(true); // Reset products on filter change
  }, [
    filters.category,
    filters.subcategory,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.sortBy,
    filters.length,
    filters.color,
    filters.texture,
  ]);

  useEffect(() => {
    if (page > 1) fetchProducts();
  }, [page]);

  useEffect(() => {
    // Update URL when filters change
    const query = {};
    if (filters.category) {
      const category = categories.find((cat) => cat.id === filters.category);
      if (category) query.category = category.slug;
    }
    if (filters.subcategory) {
      const subcategory = categories.find(
        (cat) => cat.id === filters.subcategory
      );
      if (subcategory) query.subcategory = subcategory.slug;
    }
    const queryString = new URLSearchParams(query).toString();
    router.push(`/products${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [filters.category, filters.subcategory, categories]);

  const fetchProducts = async (reset = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories!products_category_id_fkey(name, slug),
          product_images(image_url, alt_text, is_primary)
        `
        )
        .eq("is_active", true);

      if (
        filters.category &&
        typeof filters.category === "string" &&
        filters.category.length > 0
      ) {
        query = query.eq("category_id", filters.category);
      }
      if (
        filters.subcategory &&
        typeof filters.subcategory === "string" &&
        filters.subcategory.length > 0
      ) {
        query = query.eq("subcategory_id", filters.subcategory);
      }
      if (typeof filters.minPrice === "number" && filters.minPrice > 0) {
        query = query.gte("price", filters.minPrice);
      }
      if (typeof filters.maxPrice === "number" && filters.maxPrice < 999999) {
        query = query.lte("price", filters.maxPrice);
      }
      if (
        filters.search &&
        typeof filters.search === "string" &&
        filters.search.trim().length > 0
      ) {
        query = query.ilike("name", `%${filters.search.trim()}%`);
      }
      if (
        filters.length &&
        typeof filters.length === "string" &&
        filters.length.length > 0
      ) {
        query = query.contains("lengths", [filters.length]);
      }
      if (
        filters.color &&
        typeof filters.color === "string" &&
        filters.color.length > 0
      ) {
        query = query.contains("colors", [filters.color]);
      }
      if (
        filters.texture &&
        typeof filters.texture === "string" &&
        filters.texture.length > 0
      ) {
        query = query.contains("textures", [filters.texture]);
      }

      switch (filters.sortBy) {
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        default:
          query = query.order("name");
      }

      const limit = 12;
      const offset = reset ? 0 : (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      console.log("Querying products with:", {
        category: filters.category,
        subcategory: filters.subcategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search,
        length: filters.length,
        color: filters.color,
        texture: filters.texture,
        sortBy: filters.sortBy,
        offset,
        limit,
      });

      const { data, error } = await query;
      if (error) throw error;

      const newProducts = data || [];
      console.log(
        "Fetched products:",
        newProducts.map((p) => p.id)
      );

      const uniqueProducts = reset
        ? newProducts
        : [...products, ...newProducts].filter(
            (product, index, self) =>
              index === self.findIndex((p) => p.id === product.id)
          );

      setProducts(uniqueProducts);
      setHasMore(newProducts.length === limit);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    setPage(1);
  };

  const loadMore = () => {
    setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
            Premium Hair Collection
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Discover our complete range of luxury human hair bundles and
            extensions
          </p>
        </div>
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md w-full sm:w-auto justify-center sm:justify-start"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <AnimatePresence>
            {(showFilters || true) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`lg:w-80 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg sm:text-xl">
                      Filters
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Products
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        placeholder="Search for hair products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Categories
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories
                        .filter((cat) => !cat.parent_id)
                        .map((category) => (
                          <div key={category.id}>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="category"
                                value={category.id}
                                checked={filters.category === category.id}
                                onChange={() =>
                                  handleFilterChange("category", category.id)
                                }
                                className="text-primary-600 focus:ring-primary-500"
                              />
                              <span className="ml-2 text-gray-700 text-sm sm:text-base">
                                {category.name}
                              </span>
                            </label>
                            {categories
                              .filter((sub) => sub.parent_id === category.id)
                              .map((subcategory) => (
                                <label
                                  key={subcategory.id}
                                  className="flex items-center ml-6"
                                >
                                  <input
                                    type="radio"
                                    name="subcategory"
                                    value={subcategory.id}
                                    checked={
                                      filters.subcategory === subcategory.id
                                    }
                                    onChange={() =>
                                      handleFilterChange(
                                        "subcategory",
                                        subcategory.id
                                      )
                                    }
                                    className="text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="ml-2 text-gray-600 text-sm">
                                    {subcategory.name}
                                  </span>
                                </label>
                              ))}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Price Range
                    </h4>
                    <div className="space-y-2">
                      {priceRanges.map((range, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={
                              filters.minPrice === range.min &&
                              filters.maxPrice === range.max
                            }
                            onChange={() => {
                              handleFilterChange("minPrice", range.min);
                              handleFilterChange("maxPrice", range.max);
                            }}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Length</h4>
                    <div className="space-y-2">
                      {lengths.map((length, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="length"
                            value={length}
                            checked={filters.length === length}
                            onChange={() =>
                              handleFilterChange("length", length)
                            }
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">
                            {length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Color</h4>
                    <div className="space-y-2">
                      {colors.map((color, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            checked={filters.color === color}
                            onChange={() => handleFilterChange("color", color)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">
                            {color}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Texture</h4>
                    <div className="space-y-2">
                      {textures.map((texture, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="texture"
                            value={texture}
                            checked={filters.texture === texture}
                            onChange={() =>
                              handleFilterChange("texture", texture)
                            }
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-gray-700 text-sm sm:text-base">
                            {texture}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                    >
                      <option value="name">Name A-Z</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600 text-sm sm:text-base">
                Showing {products.length} products
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary-100 text-primary-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-primary-100 text-primary-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
            {loading && page === 1 ? (
              <div
                className={`grid gap-6 sm:gap-8 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-white rounded-2xl p-4 shadow-lg animate-pulse"
                  >
                    <div className="h-48 sm:h-64 lg:h-80 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`grid gap-6 sm:gap-8 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      images:
                        product.product_images?.map((img) => img.image_url) ||
                        [],
                    }}
                  />
                ))}
              </div>
            )}
            {hasMore && !loading && (
              <div className="text-center mt-12">
                <button onClick={loadMore} className="btn-primary">
                  Load More Products
                </button>
              </div>
            )}
            {loading && page > 1 && (
              <div className="text-center mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            )}
            {!loading && products.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
