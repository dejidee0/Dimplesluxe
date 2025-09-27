import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Grid,
  List,
  AlertTriangle,
  X,
  Camera,
  DollarSign,
  Tag,
  Globe,
  Save,
  AlertCircle,
} from "lucide-react";

// ProductsManagement Component (Fixed Version)
const ProductsManagement = ({
  loading = false,
  products: initialProducts = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories = [],
  supabase,
}) => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    category_id: "",
    subcategory_id: "",
    stock: "",
    lengths: [],
    colors: [],
    textures: [],
    weight: "",
    origin_country: "Brazil",
    is_featured: false,
    is_new: false,
    is_sale: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
    image_url: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Image handling functions
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const uploadImage = async (file) => {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteImage = async (imageUrl) => {
    if (!supabase || !imageUrl) return;

    try {
      const path = imageUrl.split("/").pop();
      await supabase.storage
        .from("product-images")
        .remove([`products/${path}`]);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: "",
      original_price: "",
      category_id: "",
      subcategory_id: "",
      stock: "",
      lengths: [],
      colors: [],
      textures: [],
      weight: "",
      origin_country: "Brazil",
      is_featured: false,
      is_new: false,
      is_sale: false,
      is_active: true,
      meta_title: "",
      meta_description: "",
      image_url: "",
    });
    setErrors({});
    setSelectedProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    const values = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // Handle image upload if new image is selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error("Error uploading image:", error);
          setErrors((prev) => ({
            ...prev,
            image: "Failed to upload image. Please try again.",
          }));
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        stock: parseInt(formData.stock),
        image_url: imageUrl,
      };

      if (selectedProduct) {
        // Update product
        // If updating with new image, delete old image
        if (
          imageFile &&
          selectedProduct.image_url &&
          selectedProduct.image_url !== imageUrl
        ) {
          await deleteImage(selectedProduct.image_url);
        }

        const updatedProduct = { ...selectedProduct, ...productData };
        await onUpdateProduct?.(updatedProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
        );
        setShowEditModal(false);
      } else {
        // Add new product
        const newProduct = {
          id: crypto.randomUUID(),
          ...productData,
          rating: 0,
          review_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await onAddProduct?.(newProduct);
        setProducts((prev) => [...prev, newProduct]);
        setShowAddModal(false);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price?.toString() || "",
      original_price: product.original_price?.toString() || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      stock: product.stock?.toString() || "",
      lengths: product.lengths || [],
      colors: product.colors || [],
      textures: product.textures || [],
      weight: product.weight || "",
      origin_country: product.origin_country || "Brazil",
      is_featured: product.is_featured || false,
      is_new: product.is_new || false,
      is_sale: product.is_sale || false,
      is_active: product.is_active !== false,
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      image_url: product.image_url || "",
    });

    // Set existing image as preview if available
    if (product.image_url) {
      setImagePreview(product.image_url);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      // Delete associated image first
      if (selectedProduct.image_url) {
        await deleteImage(selectedProduct.image_url);
      }

      await onDeleteProduct?.(selectedProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      resetForm();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;
      const matchesStock = !showLowStock || (product.stock || 0) < 10;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "stock-high":
          return (b.stock || 0) - (a.stock || 0);
        case "stock-low":
          return (a.stock || 0) - (b.stock || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

  // Get active categories for filter dropdown
  const activeCategories = categories.filter((cat) => cat.is_active !== false);
  const categoryOptions = [
    { id: "all", name: "All Categories" },
    ...activeCategories.map((cat) => ({ id: cat.id, name: cat.name })),
  ];

  // Get subcategories for selected category
  const getSubcategories = (parentId) => {
    return activeCategories.filter((cat) => cat.parent_id === parentId);
  };

  // Product statistics
  const productStats = {
    total: products.length,
    active: products.filter((p) => p.is_active !== false).length,
    inactive: products.filter((p) => p.is_active === false).length,
    lowStock: products.filter((p) => (p.stock || 0) < 10).length,
    outOfStock: products.filter((p) => (p.stock || 0) === 0).length,
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        color: "bg-red-400",
        text: "Out of Stock",
        textColor: "text-red-700",
      };
    if (stock < 5)
      return {
        color: "bg-red-400",
        text: "Critical",
        textColor: "text-red-700",
      };
    if (stock < 10)
      return {
        color: "bg-yellow-400",
        text: "Low",
        textColor: "text-yellow-700",
      };
    if (stock < 20)
      return {
        color: "bg-blue-400",
        text: "Medium",
        textColor: "text-blue-700",
      };
    return { color: "bg-green-400", text: "Good", textColor: "text-green-700" };
  };

  const ProductCard = ({ product }) => {
    const stockStatus = getStockStatus(product.stock || 0);
    const category = activeCategories.find(
      (cat) => cat.id === product.category_id
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>

          {/* Stock indicator */}
          <div className="absolute top-3 right-3">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                product.stock === 0
                  ? "bg-red-500"
                  : product.stock < 10
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            >
              {product.stock || 0} in stock
            </div>
          </div>

          {/* Rating */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 text-xs shadow-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="font-medium">{product.rating || 0}</span>
            </div>
          </div>

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {product.is_featured && (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </div>
            )}
            {product.is_new && (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                New
              </div>
            )}
            {product.is_sale && (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Sale
              </div>
            )}
            {!product.is_active && (
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
          </div>

          {/* Category and SKU */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {category?.name || "Uncategorized"}
            </span>
            <span className="text-xs text-gray-600">
              ID: {product.id?.slice(0, 8)}
            </span>
          </div>

          {/* Price and stock */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-pink-600">
                {formatPrice(product.price || 0)}
              </span>
              {product.original_price &&
                product.original_price > product.price && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
            </div>
            <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(product)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>
            <button
              onClick={() => handleEdit(product)}
              className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(product)}
              className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const ProductRow = ({ product }) => {
    const stockStatus = getStockStatus(product.stock || 0);
    const category = activeCategories.find(
      (cat) => cat.id === product.category_id
    );

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="py-4 px-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                {category?.name || "Uncategorized"}
              </p>
              <p className="text-xs text-gray-500">
                ID: {product.id?.slice(0, 8)}
              </p>
            </div>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-pink-600">
              {formatPrice(product.price || 0)}
            </span>
            {product.original_price &&
              product.original_price > product.price && (
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
            <span className={`text-sm font-medium ${stockStatus.textColor}`}>
              {product.stock || 0}
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex flex-col space-y-1">
            {product.is_active !== false && (
              <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </div>
            )}
            {product.is_featured && (
              <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </div>
            )}
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating || 0}</span>
            <span className="text-xs text-gray-500">
              ({product.review_count || 0})
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(product)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(product)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const ProductModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div
          className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
          onClick={handleBackdropClick}
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg md:max-w-2xl lg:max-w-4xl sm:w-full sm:p-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Product Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">
            {productStats.total}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {productStats.active}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {productStats.inactive}
          </div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {productStats.lowStock}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {productStats.outOfStock}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-high">Price High-Low</option>
              <option value="price-low">Price Low-High</option>
              <option value="stock-high">Stock High-Low</option>
              <option value="stock-low">Stock Low-High</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showLowStock
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Low Stock</span>
            </button>

            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded ${
                  viewMode === "grid"
                    ? "bg-pink-100 text-pink-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded ${
                  viewMode === "list"
                    ? "bg-pink-100 text-pink-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "all" || showLowStock
              ? "Try adjusting your search or filters"
              : "Start by adding your first product to get started"}
          </p>
          {!searchTerm && selectedCategory === "all" && !showLowStock && (
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Product
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Price
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Stock
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Rating
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <ProductRow key={product.id} product={product} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-3">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Total Value:{" "}
                {formatPrice(
                  filteredProducts.reduce(
                    (sum, product) =>
                      sum + (product.price || 0) * (product.stock || 0),
                    0
                  )
                )}
              </span>
              <span>
                Low Stock Items:{" "}
                {filteredProducts.filter((p) => (p.stock || 0) < 10).length}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Product Modal */}
      <ProductModal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        title={selectedProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Basic Information</span>
              </h4>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="product-image"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="product-image"
                              name="product-image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, WebP up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {uploadingImage && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading image...
                  </div>
                )}
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.image}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="auto-generated-from-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Detailed product description"
                />
              </div>
            </div>

            {/* Pricing and Inventory */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Pricing & Inventory</span>
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      errors.price ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.price}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.stock ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.stock}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.category_id ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {activeCategories
                    .filter((cat) => !cat.parent_id) // Only show parent categories
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.category_id}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={!formData.category_id}
                >
                  <option value="">Select a subcategory</option>
                  {getSubcategories(formData.category_id)
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                </select>
                {!formData.category_id && (
                  <p className="text-gray-500 text-xs mt-1">
                    Select a category first to see subcategories
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Attributes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Product Attributes</span>
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Lengths (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.lengths.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("lengths", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., 10cm, 20cm, 30cm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Colors (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.colors.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("colors", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., Black, Brown, Blonde"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Textures (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.textures.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("textures", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., Straight, Wavy, Curly"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., 100g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origin Country
                  </label>
                  <input
                    type="text"
                    name="origin_country"
                    value={formData.origin_country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Brazil"
                  />
                </div>
              </div>
            </div>

            {/* SEO and Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>SEO & Settings</span>
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="SEO description for search engines"
                />
              </div>

              {/* Product Status Toggles */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">
                  Product Status
                </h5>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active (visible to customers)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm text-gray-700"
                  >
                    Featured product
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_new"
                    name="is_new"
                    checked={formData.is_new}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="is_new" className="text-sm text-gray-700">
                    New arrival
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_sale"
                    name="is_sale"
                    checked={formData.is_sale}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="is_sale" className="text-sm text-gray-700">
                    On sale
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {selectedProduct ? "Update Product" : "Create Product"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </ProductModal>

      {/* View Product Modal */}
      <ProductModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduct(null);
        }}
        title="Product Details"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Image and Basic Info */}
              <div className="space-y-4">
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      selectedProduct.image_url ? "hidden" : "flex"
                    }`}
                  >
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedProduct.is_active && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                  {selectedProduct.is_featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Featured
                    </span>
                  )}
                  {selectedProduct.is_new && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  )}
                  {selectedProduct.is_sale && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Sale
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedProduct.short_description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Price
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-pink-600">
                        {formatPrice(selectedProduct.price)}
                      </span>
                      {selectedProduct.original_price &&
                        selectedProduct.original_price >
                          selectedProduct.price && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(selectedProduct.original_price)}
                          </span>
                        )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Stock
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">
                        {selectedProduct.stock || 0}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          getStockStatus(selectedProduct.stock || 0).color
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Category
                    </label>
                    <span className="text-gray-900">
                      {activeCategories.find(
                        (cat) => cat.id === selectedProduct.category_id
                      )?.name || "Uncategorized"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-900">
                        {selectedProduct.rating || 0}
                      </span>
                      <span className="text-gray-500">
                        ({selectedProduct.review_count || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {/* Product Attributes */}
                <div className="grid grid-cols-1 gap-3">
                  {selectedProduct.lengths &&
                    selectedProduct.lengths.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Available Lengths
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProduct.lengths.map((length, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                            >
                              {length}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedProduct.colors &&
                    selectedProduct.colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Available Colors
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProduct.colors.map((color, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedProduct.textures &&
                    selectedProduct.textures.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Available Textures
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProduct.textures.map((texture, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                            >
                              {texture}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {selectedProduct.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Weight
                      </label>
                      <span className="text-gray-900">
                        {selectedProduct.weight}
                      </span>
                    </div>
                  )}

                  {selectedProduct.origin_country && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Origin Country
                      </label>
                      <span className="text-gray-900">
                        {selectedProduct.origin_country}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedProduct);
                }}
                className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Product</span>
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ProductModal>

      {/* Delete Confirmation Modal */}
      <ProductModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Are you sure?</h4>
                <p className="text-sm text-red-600">
                  This action cannot be undone. This will permanently delete the
                  product.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">
                Product to be deleted:
              </h5>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedProduct.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(selectedProduct.price)} •{" "}
                    {selectedProduct.stock} in stock
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        )}
      </ProductModal>
    </motion.div>
  );
};

export default ProductsManagement;
