import { useState, useCallback } from "react";

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      image_url: "",
    });
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (
      formData.original_price &&
      parseFloat(formData.original_price) <= parseFloat(formData.price)
    )
      newErrors.original_price =
        "Original price must be greater than current price";
    if (formData.name.length > 100)
      newErrors.name = "Product name must be 100 characters or less";
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug))
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const uploadImage = useCallback(
    async (file) => {
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
      return publicUrl;
    },
    [supabase]
  );

  const deleteImage = useCallback(
    async (imageUrl) => {
      if (!supabase || !imageUrl) return;
      try {
        const path = imageUrl.split("/").pop();
        await supabase.storage
          .from("product-images")
          .remove([`products/${path}`]);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    },
    [supabase]
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
    const values = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    setFormData((prev) => ({ ...prev, [field]: values }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
    setErrors((prev) => ({ ...prev, image: "" }));
  }, []);

  const handleSubmit = useCallback(
    async (e, selectedProduct, setProducts, closeModal) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        let imageUrl = formData.image_url;

        if (imageFile) {
          setUploadingImage(true);
          try {
            imageUrl = await uploadImage(imageFile);
          } catch (error) {
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
        } else {
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
        }

        resetForm();
        closeModal();
      } catch (error) {
        console.error("Error saving product:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Failed to save product. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      imageFile,
      validateForm,
      uploadImage,
      deleteImage,
      onAddProduct,
      onUpdateProduct,
      resetForm,
    ]
  );

  const handleDelete = useCallback(
    async (product, setProducts, closeModal) => {
      try {
        if (product.image_url) {
          await deleteImage(product.image_url);
        }
        await onDeleteProduct?.(product.id);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        closeModal();
        resetForm();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    },
    [deleteImage, onDeleteProduct, resetForm]
  );

  const populateForm = useCallback((product) => {
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
    setImagePreview(product.image_url || null);
    setImageFile(null);
  }, []);

  return {
    formData,
    errors,
    imageFile,
    imagePreview,
    isSubmitting,
    uploadingImage,
    handleInputChange,
    handleArrayInputChange,
    handleImageChange,
    removeImage,
    handleSubmit,
    handleDelete,
    populateForm,
    resetForm,
  };
};
