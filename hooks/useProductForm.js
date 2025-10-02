import { useState, useCallback } from "react";

const MAX_TOTAL_SIZE = 40 * 1024 * 1024; // 40MB
const MAX_INDIVIDUAL_SIZE = 10 * 1024 * 1024; // 10MB

export const useProductForm = (
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  supabase
) => {
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
    lengths: "", // Changed from []
    colors: "", // Changed from []
    textures: "",
    weight: "",
    origin_country: "Brazil",
    is_featured: false,
    is_new: false,
    is_sale: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
  });

  const [errors, setErrors] = useState({});

  // Changed: Multi-image state instead of single image
  const [images, setImages] = useState([]);
  // Structure: [{ id, file, preview, url, isPrimary, sortOrder, size }]

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const generateSlug = useCallback((name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, []);

  const resetForm = useCallback(() => {
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
    });
    setErrors({});
    setImages([]);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    if (
      formData.original_price &&
      parseFloat(formData.original_price) <= parseFloat(formData.price)
    ) {
      newErrors.original_price =
        "Original price must be greater than current price";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Product name must be 100 characters or less";
    }

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // NEW: Validate images
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      newErrors.images = `Total image size (${formatFileSize(
        totalSize
      )}) exceeds 40MB limit`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images]);

  // NEW: Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // NEW: Upload single image to Supabase Storage
  const uploadImage = useCallback(
    async (file, sortOrder) => {
      if (!supabase) throw new Error("Supabase client not available");

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        sortOrder,
        size: file.size,
      };
    },
    [supabase]
  );

  // NEW: Upload multiple images
  const uploadImages = useCallback(
    async (imageFiles) => {
      if (!supabase) throw new Error("Supabase client not available");

      const uploadPromises = imageFiles.map((img, index) =>
        uploadImage(img.file, img.sortOrder || index)
      );

      return await Promise.all(uploadPromises);
    },
    [supabase, uploadImage]
  );

  // NEW: Delete single image from storage
  const deleteImage = useCallback(
    async (imagePath) => {
      if (!supabase || !imagePath) return;
      try {
        // Extract path from URL or use as-is
        const path = imagePath.includes("/")
          ? imagePath.split("/products/").pop()
          : imagePath;

        await supabase.storage
          .from("product-images")
          .remove([`products/${path}`]);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    },
    [supabase]
  );

  // NEW: Delete multiple images
  const deleteImages = useCallback(
    async (imagePaths) => {
      if (!supabase || !imagePaths || imagePaths.length === 0) return;

      const deletePromises = imagePaths.map((path) => deleteImage(path));
      await Promise.all(deletePromises);
    },
    [supabase, deleteImage]
  );

  // NEW: Save product images to database
  const saveProductImages = useCallback(
    async (productId, uploadedImages, imageMetadata) => {
      if (!supabase) throw new Error("Supabase client not available");

      const imageRecords = uploadedImages.map((uploaded, index) => {
        const metadata = imageMetadata[index];
        return {
          product_id: productId,
          image_url: uploaded.url,
          alt_text: `${formData.name} - Image ${index + 1}`,
          is_primary: metadata.isPrimary || false,
          sort_order: uploaded.sortOrder,
          file_size: uploaded.size,
        };
      });

      const { data, error } = await supabase
        .from("product_images")
        .insert(imageRecords)
        .select();

      if (error) throw error;
      return data;
    },
    [supabase, formData.name]
  );

  // NEW: Update product images (for edit mode)
  const updateProductImages = useCallback(
    async (productId, newImages, existingImages = []) => {
      if (!supabase) throw new Error("Supabase client not available");

      // Delete removed images
      const existingUrls = existingImages.map(
        (img) => img.url || img.image_url
      );
      const newUrls = newImages.filter((img) => img.url).map((img) => img.url);
      const imagesToDelete = existingImages.filter(
        (img) => !newUrls.includes(img.url || img.image_url)
      );

      if (imagesToDelete.length > 0) {
        // Delete from storage
        await deleteImages(
          imagesToDelete.map((img) => img.image_url || img.url)
        );

        // Delete from database
        const idsToDelete = imagesToDelete.map((img) => img.id).filter(Boolean);
        if (idsToDelete.length > 0) {
          await supabase.from("product_images").delete().in("id", idsToDelete);
        }
      }

      // Upload new images (those with file property)
      const newImagesToUpload = newImages.filter((img) => img.file);
      let uploadedImages = [];

      if (newImagesToUpload.length > 0) {
        uploadedImages = await uploadImages(newImagesToUpload);
      }

      // Update existing images' metadata (primary status, sort order)
      const imagesToUpdate = newImages
        .filter((img) => img.id && !img.file)
        .map((img, index) => ({
          id: img.id,
          is_primary: img.isPrimary || false,
          sort_order: index,
        }));

      if (imagesToUpdate.length > 0) {
        for (const img of imagesToUpdate) {
          await supabase
            .from("product_images")
            .update({
              is_primary: img.is_primary,
              sort_order: img.sort_order,
            })
            .eq("id", img.id);
        }
      }

      // Insert newly uploaded images
      if (uploadedImages.length > 0) {
        await saveProductImages(productId, uploadedImages, newImagesToUpload);
      }

      return true;
    },
    [supabase, uploadImages, deleteImages, saveProductImages]
  );

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (name === "name") {
        setFormData((prev) => ({
          ...prev,
          slug: generateSlug(value),
        }));
      }

      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [generateSlug]
  );

  const handleArrayInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  const parseArrayField = (value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
    }
    return Array.isArray(value) ? value : [];
  };
  // NEW: Handle multiple image selection
  const handleImagesChange = useCallback(
    (newFiles) => {
      const totalCurrentSize = images.reduce(
        (sum, img) => sum + (img.size || 0),
        0
      );
      const validFiles = [];
      let currentSize = totalCurrentSize;

      for (const file of newFiles) {
        // Check individual file size
        if (file.size > MAX_INDIVIDUAL_SIZE) {
          setErrors((prev) => ({
            ...prev,
            images: `${file.name} exceeds 10MB individual file size limit`,
          }));
          continue;
        }

        // Check total size
        if (currentSize + file.size > MAX_TOTAL_SIZE) {
          setErrors((prev) => ({
            ...prev,
            images: `Cannot add ${file.name}. Total size would exceed 40MB limit`,
          }));
          break;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          setErrors((prev) => ({
            ...prev,
            images: `${file.name} is not an image file`,
          }));
          continue;
        }

        currentSize += file.size;
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        const newImages = validFiles.map((file, index) => {
          const reader = new FileReader();
          const preview = new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });

          return {
            id: crypto.randomUUID(),
            file,
            preview: null, // Will be set after FileReader completes
            size: file.size,
            isPrimary: images.length === 0 && index === 0,
            sortOrder: images.length + index,
          };
        });

        // Set previews asynchronously
        newImages.forEach((img, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImages((prev) =>
              prev.map((prevImg) =>
                prevImg.id === img.id
                  ? { ...prevImg, preview: e.target.result }
                  : prevImg
              )
            );
          };
          reader.readAsDataURL(validFiles[index]);
        });

        setImages((prev) => [...prev, ...newImages]);
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    },
    [images]
  );

  // NEW: Remove image
  const handleRemoveImage = useCallback((index) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);

      // If removed image was primary, make first image primary
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }

      // Update sort orders
      return newImages.map((img, i) => ({ ...img, sortOrder: i }));
    });
  }, []);

  // NEW: Set primary image
  const handleSetPrimaryImage = useCallback((index) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  }, []);

  // NEW: Reorder images
  const handleReorderImages = useCallback((fromIndex, toIndex) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      // Update sort orders
      return newImages.map((img, i) => ({ ...img, sortOrder: i }));
    });
  }, []);

  const handleSubmit = useCallback(
    async (e, selectedProduct, setProducts, closeModal) => {
      e.preventDefault();
      if (!validateForm()) {
        setErrors((prev) => ({
          ...prev,
          general: "Please fix the errors above before submitting",
        }));
        return;
      }

      setIsSubmitting(true);

      try {
        const productData = {
          ...formData,
          price: parseFloat(formData.price),
          original_price: formData.original_price
            ? parseFloat(formData.original_price)
            : null,
          stock: parseInt(formData.stock),
          lengths: parseArrayField(formData.lengths),
          colors: parseArrayField(formData.colors),
          textures: parseArrayField(formData.textures),
        };

        if (selectedProduct) {
          // UPDATE EXISTING PRODUCT
          setUploadingImages(true);

          try {
            // Update images
            await updateProductImages(
              selectedProduct.id,
              images,
              selectedProduct.images || []
            );

            // Update product data
            const { data: updatedProduct, error } = await supabase
              .from("products")
              .update(productData)
              .eq("id", selectedProduct.id)
              .select()
              .single();

            if (error) throw error;

            // Fetch updated images
            const { data: updatedImages } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", selectedProduct.id)
              .order("sort_order");

            const productWithImages = {
              ...updatedProduct,
              images: updatedImages || [],
            };

            await onUpdateProduct?.(productWithImages);
            setProducts((prev) =>
              prev.map((p) =>
                p.id === selectedProduct.id ? productWithImages : p
              )
            );
          } catch (error) {
            console.error("Error updating images:", error);
            throw new Error("Failed to update product images");
          } finally {
            setUploadingImages(false);
          }
        } else {
          // CREATE NEW PRODUCT
          setUploadingImages(true);

          try {
            // Create product first
            const { data: newProduct, error: productError } = await supabase
              .from("products")
              .insert([productData])
              .select()
              .single();

            if (productError) throw productError;

            // Upload and save images
            const imagesToUpload = images.filter((img) => img.file);
            const uploadedImages = await uploadImages(imagesToUpload);
            await saveProductImages(newProduct.id, uploadedImages, images);

            // Fetch saved images
            const { data: savedImages } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", newProduct.id)
              .order("sort_order");

            const productWithImages = {
              ...newProduct,
              images: savedImages || [],
            };

            await onAddProduct?.(productWithImages);
            setProducts((prev) => [...prev, productWithImages]);
          } catch (error) {
            console.error("Error creating product:", error);
            throw new Error("Failed to create product with images");
          } finally {
            setUploadingImages(false);
          }
        }

        resetForm();
        closeModal();
      } catch (error) {
        console.error("Error saving product:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Failed to save product. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      images,
      validateForm,
      uploadImages,
      saveProductImages,
      updateProductImages,
      onAddProduct,
      onUpdateProduct,
      resetForm,
      supabase,
    ]
  );

  const handleDelete = useCallback(
    async (product, setProducts, closeModal) => {
      try {
        // Delete all product images from storage
        if (product.images && product.images.length > 0) {
          await deleteImages(product.images.map((img) => img.image_url));
        }

        // Delete from database (cascade will handle product_images table)
        await onDeleteProduct?.(product.id);

        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        closeModal();
        resetForm();
      } catch (error) {
        console.error("Error deleting product:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Failed to delete product. Please try again.",
        }));
      }
    },
    [deleteImages, onDeleteProduct, resetForm]
  );

  // NEW: Populate form with existing product data
  const populateForm = useCallback(
    async (product) => {
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
        lengths: Array.isArray(product.lengths)
          ? product.lengths.join(", ")
          : "",
        colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
        textures: Array.isArray(product.textures)
          ? product.textures.join(", ")
          : "",
        weight: product.weight || "",
        origin_country: product.origin_country || "Brazil",
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_sale: product.is_sale || false,
        is_active: product.is_active !== false,
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });

      // Load existing images
      if (supabase && product.id) {
        const { data: existingImages } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", product.id)
          .order("sort_order");

        if (existingImages && existingImages.length > 0) {
          const formattedImages = existingImages.map((img, index) => ({
            id: img.id,
            url: img.image_url,
            preview: img.image_url,
            isPrimary: img.is_primary,
            sortOrder: img.sort_order || index,
            size: img.file_size || 0,
          }));
          setImages(formattedImages);
        }
      }
    },
    [supabase]
  );

  return {
    formData,
    errors,
    images, // Changed from imageFile and imagePreview
    isSubmitting,
    uploadingImages, // Changed from uploadingImage
    handleInputChange,
    handleArrayInputChange,
    handleImagesChange, // NEW
    handleRemoveImage, // NEW
    handleSetPrimaryImage, // NEW
    handleReorderImages, // NEW
    handleSubmit,
    handleDelete,
    populateForm,
    resetForm,
  };
};
