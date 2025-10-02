import React, { useRef, useEffect, useState } from "react";
import {
  Package,
  DollarSign,
  Tag,
  Globe,
  Save,
  AlertCircle,
  Camera,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  GripVertical,
  Trash2,
} from "lucide-react";

// Multi-Image Upload Component
const MultiImageUpload = ({
  images,
  onImagesChange,
  onRemoveImage,
  onSetPrimary,
  onReorder,
  uploadingImages,
  errors,
  maxTotalSize = 40 * 1024 * 1024, // 40MB
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
  const remainingSize = maxTotalSize - totalSize;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = [];
    let currentSize = totalSize;

    for (const file of files) {
      if (currentSize + file.size > maxTotalSize) {
        alert(
          `Cannot add ${
            file.name
          }. Total size would exceed 40MB limit.\nRemaining space: ${formatFileSize(
            remainingSize
          )}`
        );
        break;
      }

      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB individual file size limit`);
        continue;
      }

      currentSize += file.size;
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onImagesChange(validFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleImageDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleImageDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleImageDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images
        </label>
        <div className="text-xs text-gray-500">
          {formatFileSize(totalSize)} / {formatFileSize(maxTotalSize)} used
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
            <Upload className="w-6 h-6 text-pink-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP up to 10MB per image
            </p>
            <p className="text-xs text-gray-500">
              Remaining space: {formatFileSize(remainingSize)}
            </p>
          </div>
        </div>
      </div>

      {errors && (
        <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors}</span>
        </div>
      )}

      {uploadingImages && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span>Uploading images...</span>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Drag images to reorder • Click star to set as primary
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  dragOverIndex === index
                    ? "border-pink-400 scale-105"
                    : "border-gray-200"
                } ${draggedIndex === index ? "opacity-50" : ""} ${
                  image.isPrimary ? "ring-2 ring-pink-500" : ""
                }`}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 right-2 z-10 bg-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}

                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.preview || image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetPrimary(index);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-pink-50 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-pink-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(index);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* File Size */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatFileSize(image.size || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

// Main Product Form Component
const ProductForm = ({
  formData,
  errors,
  images = [],
  isSubmitting,
  uploadingImages,
  categories,
  onInputChange,
  onArrayInputChange,
  onImagesChange,
  onRemoveImage,
  onSetPrimaryImage,
  onReorderImages,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const activeCategories = categories.filter((cat) => cat.is_active !== false);
  const getSubcategories = (parentId) =>
    activeCategories.filter((cat) => cat.parent_id === parentId);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Multi-Image Upload Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <MultiImageUpload
          images={images}
          onImagesChange={onImagesChange}
          onRemoveImage={onRemoveImage}
          onSetPrimary={onSetPrimaryImage}
          onReorder={onReorderImages}
          uploadingImages={uploadingImages}
          errors={errors.images}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Basic Information</span>
          </h4>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Enter product name"
              ref={firstInputRef}
              aria-required="true"
              aria-invalid={!!errors.name}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL Slug
            </label>
            <input
              id="slug"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.slug ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="auto-generated-from-name"
              aria-describedby="slug-help"
            />
            {errors.slug && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.slug}</span>
              </p>
            )}
            <p id="slug-help" className="text-xs text-gray-500 mt-1">
              Auto-generated from product name
            </p>
          </div>

          <div>
            <label
              htmlFor="short_description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Short Description
            </label>
            <textarea
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={onInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="Detailed product description"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Pricing & Inventory</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price *
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                  errors.price ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="0.00"
                aria-required="true"
                aria-invalid={!!errors.price}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="original_price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Original Price
              </label>
              <input
                id="original_price"
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={onInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                  errors.original_price ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="0.00"
                aria-invalid={!!errors.original_price}
              />
              {errors.original_price && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.original_price}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Stock Quantity *
            </label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={onInputChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.stock ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="0"
              aria-required="true"
              aria-invalid={!!errors.stock}
            />
            {errors.stock && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.stock}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={onInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm ${
                errors.category_id ? "border-red-300" : "border-gray-200"
              }`}
              aria-required="true"
              aria-invalid={!!errors.category_id}
            >
              <option value="">Select a category</option>
              {activeCategories
                .filter((cat) => !cat.parent_id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.category_id}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="subcategory_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Subcategory
            </label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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

      {/* Product Attributes and SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>Product Attributes</span>
          </h4>

          <div>
            <label
              htmlFor="lengths"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Lengths (comma-separated)
            </label>
            <input
              id="lengths"
              type="text"
              value={formData.lengths}
              onChange={(e) => onArrayInputChange("lengths", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="e.g., 10cm, 20cm, 30cm"
            />
          </div>

          <div>
            <label
              htmlFor="colors"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Colors (comma-separated)
            </label>
            <input
              id="colors"
              type="text"
              value={formData.colors}
              onChange={(e) => onArrayInputChange("colors", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="e.g., Black, Brown, Blonde"
            />
          </div>

          <div>
            <label
              htmlFor="textures"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Available Textures (comma-separated)
            </label>
            <input
              id="textures"
              type="text"
              value={formData.textures}
              onChange={(e) => onArrayInputChange("textures", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="e.g., Straight, Wavy, Curly"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Weight
              </label>
              <input
                id="weight"
                type="text"
                name="weight"
                value={formData.weight}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="e.g., 100g"
              />
            </div>

            <div>
              <label
                htmlFor="origin_country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Origin Country
              </label>
              <input
                id="origin_country"
                type="text"
                name="origin_country"
                value={formData.origin_country}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="Brazil"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>SEO & Settings</span>
          </h4>

          <div>
            <label
              htmlFor="meta_title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Meta Title
            </label>
            <input
              id="meta_title"
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="SEO title for search engines"
            />
          </div>

          <div>
            <label
              htmlFor="meta_description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={onInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              placeholder="SEO description for search engines"
            />
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">
              Product Status
            </h5>
            {[
              {
                id: "is_active",
                label: "Active (visible to customers)",
                name: "is_active",
              },
              {
                id: "is_featured",
                label: "Featured product",
                name: "is_featured",
              },
              { id: "is_new", label: "New arrival", name: "is_new" },
              { id: "is_sale", label: "On sale", name: "is_sale" },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={item.id}
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={onInputChange}
                  className="w-4 h-4 text-pink-600 border-gray-200 rounded focus:ring-pink-500"
                  aria-label={item.label}
                />
                <label htmlFor={item.id} className="text-sm text-gray-700">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isEditing ? "Update Product" : "Create Product"}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? "Update Product" : "Create Product"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
