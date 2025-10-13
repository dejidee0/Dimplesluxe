// useProductForm.js
import { useState, useCallback } from "react";

const MAX_TOTAL_SIZE = 40 * 1024 * 1024; // 40MB
const MAX_INDIVIDUAL_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const useProductForm = (
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  supabase
) => {
  // Existing state
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
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // New state for videos
  const [videos, setVideos] = useState([]);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  // Existing functions: generateSlug, resetForm, formatFileSize, validateForm (modified)
  const validateForm = useCallback(() => {
    const newErrors = {};
    // Existing validations
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (
      formData.original_price &&
      parseFloat(formData.original_price) <= parseFloat(formData.price)
    ) {
      newErrors.original_price =
        "Original price must be greater than current price";
    }
    if (formData.name.length > 100)
      newErrors.name = "Product name must be 100 characters or less";
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug))
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";

    // Validate combined size of images and videos
    const totalSize =
      images.reduce((sum, img) => sum + (img.size || 0), 0) +
      videos.reduce((sum, vid) => sum + (vid.size || 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      newErrors.media = `Total media size (${formatFileSize(
        totalSize
      )}) exceeds 40MB limit`;
    }
    if (images.length === 0 && videos.length === 0) {
      newErrors.media = "At least one image or video is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images, videos]);

  // Modified: Upload single file (image or video)
  const uploadFile = useCallback(
    async (file, sortOrder, isVideo = false) => {
      if (!supabase) throw new Error("Supabase client not available");

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const bucket = isVideo ? "product-videos" : "product-images";
      const filePath = `${isVideo ? "videos" : "products"}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        sortOrder,
        size: file.size,
        isVideo,
      };
    },
    [supabase]
  );

  // Modified: Upload multiple files
  const uploadFiles = useCallback(
    async (files) => {
      const uploadPromises = files.map((item, index) =>
        uploadFile(item.file, item.sortOrder || index, item.isVideo)
      );
      return await Promise.all(uploadPromises);
    },
    [uploadFile]
  );

  // Modified: Delete single file
  const deleteFile = useCallback(
    async (filePath, isVideo = false) => {
      if (!supabase || !filePath) return;
      try {
        const path = filePath.includes("/")
          ? filePath.split("/").pop()
          : filePath;
        const bucket = isVideo ? "product-videos" : "product-images";
        await supabase.storage
          .from(bucket)
          .remove([`${isVideo ? "videos" : "products"}/${path}`]);
      } catch (error) {
        console.error(`Error deleting ${isVideo ? "video" : "image"}:`, error);
      }
    },
    [supabase]
  );

  // Modified: Delete multiple files
  const deleteFiles = useCallback(
    async (filePaths, isVideo = false) => {
      if (!supabase || !filePaths || filePaths.length === 0) return;
      const deletePromises = filePaths.map((path) => deleteFile(path, isVideo));
      await Promise.all(deletePromises);
    },
    [supabase, deleteFile]
  );

  // New: Save product videos to database
  const saveProductVideos = useCallback(
    async (productId, uploadedVideos, videoMetadata) => {
      if (!supabase) throw new Error("Supabase client not available");

      const videoRecords = uploadedVideos.map((uploaded, index) => {
        const metadata = videoMetadata[index];
        return {
          product_id: productId,
          video_url: uploaded.url,
          alt_text: `${formData.name} - Video ${index + 1}`,
          is_primary: metadata.isPrimary || false,
          sort_order: uploaded.sortOrder,
          file_size: uploaded.size,
        };
      });

      const { data, error } = await supabase
        .from("product_videos")
        .insert(videoRecords)
        .select();

      if (error) throw error;
      return data;
    },
    [supabase, formData.name]
  );

  // Modified: Update product images and videos
  const updateProductMedia = useCallback(
    async (
      productId,
      newImages,
      newVideos,
      existingImages = [],
      existingVideos = []
    ) => {
      if (!supabase) throw new Error("Supabase client not available");

      // Delete removed images
      const existingImageUrls = existingImages.map(
        (img) => img.url || img.image_url
      );
      const newImageUrls = newImages
        .filter((img) => img.url)
        .map((img) => img.url);
      const imagesToDelete = existingImages.filter(
        (img) => !newImageUrls.includes(img.url || img.image_url)
      );
      if (imagesToDelete.length > 0) {
        await deleteFiles(
          imagesToDelete.map((img) => img.image_url || img.url),
          false
        );
        const idsToDelete = imagesToDelete.map((img) => img.id).filter(Boolean);
        if (idsToDelete.length > 0) {
          await supabase.from("product_images").delete().in("id", idsToDelete);
        }
      }

      // Delete removed videos
      const existingVideoUrls = existingVideos.map(
        (vid) => vid.url || vid.video_url
      );
      const newVideoUrls = newVideos
        .filter((vid) => vid.url)
        .map((vid) => vid.url);
      const videosToDelete = existingVideos.filter(
        (vid) => !newVideoUrls.includes(vid.url || vid.video_url)
      );
      if (videosToDelete.length > 0) {
        await deleteFiles(
          videosToDelete.map((vid) => vid.video_url || vid.url),
          true
        );
        const idsToDelete = videosToDelete.map((vid) => vid.id).filter(Boolean);
        if (idsToDelete.length > 0) {
          await supabase.from("product_videos").delete().in("id", idsToDelete);
        }
      }

      // Upload new images
      const newImagesToUpload = newImages.filter((img) => img.file);
      let uploadedImages = [];
      if (newImagesToUpload.length > 0) {
        uploadedImages = await uploadFiles(newImagesToUpload);
      }

      // Upload new videos
      const newVideosToUpload = newVideos.filter((vid) => vid.file);
      let uploadedVideos = [];
      if (newVideosToUpload.length > 0) {
        uploadedVideos = await uploadFiles(newVideosToUpload);
      }

      // Update existing images' metadata
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

      // Update existing videos' metadata
      const videosToUpdate = newVideos
        .filter((vid) => vid.id && !vid.file)
        .map((vid, index) => ({
          id: vid.id,
          is_primary: vid.isPrimary || false,
          sort_order: index,
        }));
      if (videosToUpdate.length > 0) {
        for (const vid of videosToUpdate) {
          await supabase
            .from("product_videos")
            .update({
              is_primary: vid.is_primary,
              sort_order: vid.sort_order,
            })
            .eq("id", vid.id);
        }
      }

      // Insert newly uploaded media
      if (uploadedImages.length > 0) {
        await saveProductImages(productId, uploadedImages, newImagesToUpload);
      }
      if (uploadedVideos.length > 0) {
        await saveProductVideos(productId, uploadedVideos, newVideosToUpload);
      }

      return true;
    },
    [supabase, uploadFiles, deleteFiles, saveProductImages, saveProductVideos]
  );

  // Modified: Handle media change (images and videos)
  const handleMediaChange = useCallback(
    (newFiles) => {
      const totalCurrentSize =
        images.reduce((sum, img) => sum + (img.size || 0), 0) +
        videos.reduce((sum, vid) => sum + (vid.size || 0), 0);
      const validFiles = [];
      let currentSize = totalCurrentSize;

      for (const file of newFiles) {
        if (file.size > MAX_INDIVIDUAL_SIZE) {
          setErrors((prev) => ({
            ...prev,
            media: `${file.name} exceeds 10MB individual file size limit`,
          }));
          continue;
        }

        if (currentSize + file.size > MAX_TOTAL_SIZE) {
          setErrors((prev) => ({
            ...prev,
            media: `Cannot add ${file.name}. Total size would exceed 40MB limit`,
          }));
          break;
        }

        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !isVideo) {
          setErrors((prev) => ({
            ...prev,
            media: `${file.name} is not a supported image or video file`,
          }));
          continue;
        }

        currentSize += file.size;
        validFiles.push({ file, isVideo });
      }

      if (validFiles.length > 0) {
        const newMedia = validFiles.map((item, index) => {
          const reader = new FileReader();
          const preview = new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            if (item.isVideo) {
              resolve(null); // Videos don't need previews in the same way
            } else {
              reader.readAsDataURL(item.file);
            }
          });

          return {
            id: crypto.randomUUID(),
            file: item.file,
            preview: null,
            size: item.file.size,
            isPrimary:
              (item.isVideo ? videos.length : images.length) === 0 &&
              index === 0,
            sortOrder: (item.isVideo ? videos.length : images.length) + index,
            isVideo: item.isVideo,
          };
        });

        newMedia.forEach((media, index) => {
          if (!media.isVideo) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImages((prev) =>
                prev.map((prevImg) =>
                  prevImg.id === media.id
                    ? { ...prevImg, preview: e.target.result }
                    : prevImg
                )
              );
            };
            reader.readAsDataURL(validFiles[index].file);
          }
        });

        setImages((prev) => [...prev, ...newMedia.filter((m) => !m.isVideo)]);
        setVideos((prev) => [...prev, ...newMedia.filter((m) => m.isVideo)]);
        setErrors((prev) => ({ ...prev, media: "" }));
      }
    },
    [images, videos]
  );

  // New: Remove media
  const handleRemoveMedia = useCallback((index, isVideo) => {
    if (isVideo) {
      setVideos((prev) => {
        const newVideos = prev.filter((_, i) => i !== index);
        if (prev[index].isPrimary && newVideos.length > 0) {
          newVideos[0].isPrimary = true;
        }
        return newVideos.map((vid, i) => ({ ...vid, sortOrder: i }));
      });
    } else {
      setImages((prev) => {
        const newImages = prev.filter((_, i) => i !== index);
        if (prev[index].isPrimary && newImages.length > 0) {
          newImages[0].isPrimary = true;
        }
        return newImages.map((img, i) => ({ ...img, sortOrder: i }));
      });
    }
  }, []);

  // New: Set primary media
  const handleSetPrimaryMedia = useCallback((index, isVideo) => {
    if (isVideo) {
      setVideos((prev) =>
        prev.map((vid, i) => ({
          ...vid,
          isPrimary: i === index,
        }))
      );
    } else {
      setImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        }))
      );
    }
  }, []);

  // New: Reorder media
  const handleReorderMedia = useCallback((fromIndex, toIndex, isVideo) => {
    if (isVideo) {
      setVideos((prev) => {
        const newVideos = [...prev];
        const [movedVideo] = newVideos.splice(fromIndex, 1);
        newVideos.splice(toIndex, 0, movedVideo);
        return newVideos.map((vid, i) => ({ ...vid, sortOrder: i }));
      });
    } else {
      setImages((prev) => {
        const newImages = [...prev];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        return newImages.map((img, i) => ({ ...img, sortOrder: i }));
      });
    }
  }, []);

  // Modified: Handle submit
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
          setUploadingVideos(true);
          try {
            await updateProductMedia(
              selectedProduct.id,
              images,
              videos,
              selectedProduct.images || [],
              selectedProduct.videos || []
            );

            const { data: updatedProduct, error } = await supabase
              .from("products")
              .update(productData)
              .eq("id", selectedProduct.id)
              .select()
              .single();

            if (error) throw error;

            const { data: updatedImages } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", selectedProduct.id)
              .order("sort_order");

            const { data: updatedVideos } = await supabase
              .from("product_videos")
              .select("*")
              .eq("product_id", selectedProduct.id)
              .order("sort_order");

            const productWithMedia = {
              ...updatedProduct,
              images: updatedImages || [],
              videos: updatedVideos || [],
            };

            await onUpdateProduct?.(productWithMedia);
            setProducts((prev) =>
              prev.map((p) =>
                p.id === selectedProduct.id ? productWithMedia : p
              )
            );
          } catch (error) {
            console.error("Error updating product:", error);
            throw new Error(
              error.message || "Failed to update product and media"
            );
          } finally {
            setUploadingImages(false);
            setUploadingVideos(false);
          }
        } else {
          // CREATE NEW PRODUCT
          setUploadingImages(true);
          setUploadingVideos(true);
          try {
            const { data: newProduct, error: productError } = await supabase
              .from("products")
              .insert([productData])
              .select()
              .single();

            if (productError) throw productError;

            const imagesToUpload = images.filter((img) => img.file);
            const videosToUpload = videos.filter((vid) => vid.file);
            const uploadedImages = await uploadFiles(imagesToUpload);
            const uploadedVideos = await uploadFiles(videosToUpload);

            await saveProductImages(
              newProduct.id,
              uploadedImages,
              imagesToUpload
            );
            await saveProductVideos(
              newProduct.id,
              uploadedVideos,
              videosToUpload
            );

            const { data: savedImages } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", newProduct.id)
              .order("sort_order");

            const { data: savedVideos } = await supabase
              .from("product_videos")
              .select("*")
              .eq("product_id", newProduct.id)
              .order("sort_order");

            const productWithMedia = {
              ...newProduct,
              images: savedImages || [],
              videos: savedVideos || [],
            };

            await onAddProduct?.(productWithMedia);
            setProducts((prev) => [...prev, productWithMedia]);
          } catch (error) {
            console.error("Error creating product:", error);
            throw new Error(
              error.message || "Failed to create product with media"
            );
          } finally {
            setUploadingImages(false);
            setUploadingVideos(false);
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
      videos,
      validateForm,
      uploadFiles,
      saveProductImages,
      saveProductVideos,
      updateProductMedia,
      onAddProduct,
      onUpdateProduct,
      resetForm,
      supabase,
    ]
  );

  // Modified: Handle delete
  const handleDelete = useCallback(
    async (product, setProducts, closeModal) => {
      try {
        if (product.images && product.images.length > 0) {
          await deleteFiles(
            product.images.map((img) => img.image_url),
            false
          );
        }
        if (product.videos && product.videos.length > 0) {
          await deleteFiles(
            product.videos.map((vid) => vid.video_url),
            true
          );
        }

        await supabase.from("products").delete().eq("id", product.id);
        await onDeleteProduct?.(product.id);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        closeModal();
        resetForm();
      } catch (error) {
        console.error("Error deleting product:", error);
        setErrors((prev) => ({
          ...prev,
          general:
            error.message || "Failed to delete product. Please try again.",
        }));
      }
    },
    [deleteFiles, onDeleteProduct, resetForm, supabase]
  );

  // Modified: Populate form
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
      if (supabase && product.id) {
        const { data: existingImages } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", product.id)
          .order("sort_order");

        const { data: existingVideos } = await supabase
          .from("product_videos")
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
            isVideo: false,
          }));
          setImages(formattedImages);
        }

        if (existingVideos && existingVideos.length > 0) {
          const formattedVideos = existingVideos.map((vid, index) => ({
            id: vid.id,
            url: vid.video_url,
            preview: null,
            isPrimary: vid.is_primary,
            sortOrder: vid.sort_order || index,
            size: vid.file_size || 0,
            isVideo: true,
          }));
          setVideos(formattedVideos);
        }
      }
    },
    [supabase]
  );

  // Modified: Reset form
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
    setVideos([]);
  }, []);

  return {
    formData,
    errors,
    images,
    videos,
    isSubmitting,
    uploadingImages,
    uploadingVideos,
    handleInputChange,
    handleArrayInputChange,
    handleMediaChange,
    handleRemoveMedia,
    handleSetPrimaryMedia,
    handleReorderMedia,
    handleSubmit,
    handleDelete,
    populateForm,
    resetForm,
  };
};
