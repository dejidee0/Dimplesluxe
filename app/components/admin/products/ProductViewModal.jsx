// components/products/ProductViewModal.jsx
import React from "react";
import { Package, Star, Edit } from "lucide-react";
import ProductModal from "./ProductModal";
import { formatPrice, getStockStatus } from "../../../../lib/productUtils";

const ProductViewModal = ({ isOpen, onClose, product, categories, onEdit }) => {
  if (!product) return null;

  const stockStatus = getStockStatus(product.stock || 0);
  const category = categories.find((cat) => cat.id === product.category_id);

  return (
    <ProductModal isOpen={isOpen} onClose={onClose} title="Product Details">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex items-center justify-center ${
                  product.image_url ? "hidden" : "flex"
                }`}
              >
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.is_active && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
              {product.is_featured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Featured
                </span>
              )}
              {product.is_new && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  New
                </span>
              )}
              {product.is_sale && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Sale
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600">{product.short_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Price
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-pink-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price &&
                    product.original_price > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Stock
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {product.stock || 0}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${stockStatus.color}`}
                  ></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Category
                </label>
                <span className="text-gray-900">
                  {category?.name || "Uncategorized"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-gray-900">{product.rating || 0}</span>
                  <span className="text-gray-500">
                    ({product.review_count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {product.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {product.lengths?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Available Lengths
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.lengths.map((length, index) => (
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

              {product.colors?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.colors.map((color, index) => (
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

              {product.textures?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Available Textures
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.textures.map((texture, index) => (
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

              {product.weight && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Weight
                  </label>
                  <span className="text-gray-900">{product.weight}</span>
                </div>
              )}

              {product.origin_country && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Origin Country
                  </label>
                  <span className="text-gray-900">
                    {product.origin_country}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            aria-label="Edit product"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Product</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </div>
    </ProductModal>
  );
};

export default ProductViewModal;
