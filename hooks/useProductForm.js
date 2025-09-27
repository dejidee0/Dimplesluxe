// src/components/admin/products/hooks/useProductForm.js
import { useState, useCallback } from "react";
import { generateSlug, validateProductForm } from "../utils/productHelpers";

const initialFormState = {
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
  images: [],
};

export const useProductForm = (initialData = null) => {
  const [formData, setFormData] = useState(
    initialData ? { ...initialFormState, ...initialData } : initialFormState
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(
      initialData ? { ...initialFormState, ...initialData } : initialFormState
    );
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Handle input change
  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      let newValue = value;

      if (type === "checkbox") {
        newValue = checked;
      } else if (name === "name") {
        // Auto-generate slug when name changes
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          slug: generateSlug(value),
        }));
        return;
      } else if (
        name === "price" ||
        name === "original_price" ||
        name === "stock"
      ) {
        // Ensure numeric fields are handled properly
        newValue = value === "" ? "" : value;
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));

      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  // Handle array inputs (lengths, colors, textures)
  const handleArrayInput = useCallback(
    (name, value) => {
      const array = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
      setFormData((prev) => ({ ...prev, [name]: array }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  // Handle field blur (for validation)
  const handleFieldBlur = useCallback(
    (fieldName) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      // Validate single field
      const validation = validateProductForm({
        [fieldName]: formData[fieldName],
      });
      if (validation.errors[fieldName]) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: validation.errors[fieldName],
        }));
      }
    },
    [formData]
  );

  // Validate entire form
  const validateForm = useCallback(() => {
    const validation = validateProductForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  // Submit form with proper error handling
  const submitForm = useCallback(
    async (onSubmit) => {
      if (isSubmitting) return false;

      setIsSubmitting(true);

      try {
        const isValid = validateForm();
        if (!isValid) {
          setIsSubmitting(false);
          return false;
        }

        // Clean up form data before submission
        const cleanedData = {
          ...formData,
          price: parseFloat(formData.price) || 0,
          original_price: formData.original_price
            ? parseFloat(formData.original_price)
            : null,
          stock: parseInt(formData.stock) || 0,
          lengths: Array.isArray(formData.lengths) ? formData.lengths : [],
          colors: Array.isArray(formData.colors) ? formData.colors : [],
          textures: Array.isArray(formData.textures) ? formData.textures : [],
        };

        const result = await onSubmit(cleanedData);
        setIsSubmitting(false);
        return result;
      } catch (error) {
        console.error("Form submission error:", error);
        setIsSubmitting(false);

        // Set form-level error if needed
        if (error.message) {
          setErrors((prev) => ({ ...prev, _form: error.message }));
        }

        throw error;
      }
    },
    [formData, isSubmitting, validateForm]
  );

  // Set form data (for editing)
  const setFormDataForEdit = useCallback((productData) => {
    setFormData({ ...initialFormState, ...productData });
    setErrors({});
    setTouched({});
  }, []);

  // Get field error
  const getFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] ? errors[fieldName] : "";
    },
    [errors, touched]
  );

  // Check if field has error
  const hasFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] && !!errors[fieldName];
    },
    [errors, touched]
  );

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0 && Object.keys(touched).length > 0;
  }, [errors, touched]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!initialData)
      return Object.values(formData).some(
        (value) =>
          value !== "" &&
          value !== false &&
          value !== 0 &&
          (Array.isArray(value) ? value.length > 0 : true)
      );

    return (
      JSON.stringify(formData) !==
      JSON.stringify({ ...initialFormState, ...initialData })
    );
  }, [formData, initialData]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,

    // Actions
    resetForm,
    updateFormData,
    handleInputChange,
    handleArrayInput,
    handleFieldBlur,
    validateForm,
    submitForm,
    setFormDataForEdit,

    // Getters
    getFieldError,
    hasFieldError,
    isFormValid,
    hasChanges,
  };
};
