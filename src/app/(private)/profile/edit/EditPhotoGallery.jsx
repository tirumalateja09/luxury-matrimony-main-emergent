"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Trash2,
  ChevronRight,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

const CROP_BOX_SIZE = 280;
const CROPPED_IMAGE_SIZE = 1080;

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const EditPhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [cropSource, setCropSource] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const fileInputRef = useRef(null);
  const cropImageRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cropSource?.startsWith("blob:")) {
        URL.revokeObjectURL(cropSource);
      }
    };
  }, [cropSource]);

  const fetchMyPhotos = async (withLoader = false) => {
    try {
      if (withLoader) setLoading(true);
      const response = await api.get("/profile/me", "private");
      if (response?.success) {
        const profilePhotos = response?.data?.profile?.profilePhotos || [];
        setPhotos(profilePhotos);
        setCurrentIndex((prev) => {
          if (!profilePhotos.length) return 0;
          if (prev >= profilePhotos.length) return profilePhotos.length - 1;
          return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
    } finally {
      if (withLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPhotos(true);
  }, []);

  const resetCropState = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setImageDimensions({ width: 0, height: 0 });
  };

  const closeCropModal = () => {
    if (cropSource?.startsWith("blob:")) {
      URL.revokeObjectURL(cropSource);
    }
    setCropSource(null);
    setIsCropOpen(false);
    resetCropState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileInputKey((k) => k + 1);
  };

  const getCropRenderMetrics = (outputSize = CROP_BOX_SIZE) => {
    if (!imageDimensions.width || !imageDimensions.height) {
      return null;
    }

    const fitScale = Math.min(
      outputSize / imageDimensions.width,
      outputSize / imageDimensions.height,
    );
    const renderedWidth = imageDimensions.width * fitScale * zoom;
    const renderedHeight = imageDimensions.height * fitScale * zoom;
    const maxOffsetX = Math.max(0, (renderedWidth - outputSize) / 2);
    const maxOffsetY = Math.max(0, (renderedHeight - outputSize) / 2);
    const scaledOffsetX = clampValue(
      (offsetX / CROP_BOX_SIZE) * outputSize,
      -maxOffsetX,
      maxOffsetX,
    );
    const scaledOffsetY = clampValue(
      (offsetY / CROP_BOX_SIZE) * outputSize,
      -maxOffsetY,
      maxOffsetY,
    );

    return {
      width: renderedWidth,
      height: renderedHeight,
      x: (outputSize - renderedWidth) / 2 + scaledOffsetX,
      y: (outputSize - renderedHeight) / 2 + scaledOffsetY,
      maxOffsetX: (maxOffsetX / outputSize) * CROP_BOX_SIZE,
      maxOffsetY: (maxOffsetY / outputSize) * CROP_BOX_SIZE,
    };
  };

  useEffect(() => {
    const metrics = getCropRenderMetrics();
    if (!metrics) return;

    const nextOffsetX = clampValue(
      offsetX,
      -metrics.maxOffsetX,
      metrics.maxOffsetX,
    );
    const nextOffsetY = clampValue(
      offsetY,
      -metrics.maxOffsetY,
      metrics.maxOffsetY,
    );

    if (nextOffsetX !== offsetX) {
      setOffsetX(nextOffsetX);
    }
    if (nextOffsetY !== offsetY) {
      setOffsetY(nextOffsetY);
    }
  }, [zoom, imageDimensions, offsetX, offsetY]);

  const nextImage = () => {
    if (!photos.length) return;
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!photos.length) return;
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleDeleteSelectedPhoto = async () => {
    const selectedPhoto = photos[currentIndex];
    if (!selectedPhoto?._id || deleting) return;

    try {
      setDeleting(true);
      const response = await api.delete(`/profile/photo/${selectedPhoto._id}`, "private");
      if (response?.success) {
        const updated = photos.filter((photo) => photo._id !== selectedPhoto._id);
        setPhotos(updated);
        setCurrentIndex((prev) => {
          if (updated.length === 0) return 0;
          if (prev >= updated.length) return updated.length - 1;
          return prev;
        });
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error(error?.message || "Failed to delete photo");
    } finally {
      setDeleting(false);
    }
  };

  const uploadCroppedPhoto = async (file) => {
    const formData = new FormData();
    formData.append("images", file);
    await api.postFile("/profile/upload-photos", formData, "private");
    await fetchMyPhotos(false);
  };

  const handleUploadPhotos = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const availableSlots = Math.max(0, 5 - photos.length);
    if (availableSlots <= 0) {
      toast.error("You can upload maximum 5 photos.");
      setFileInputKey((k) => k + 1);
      return;
    }

    const nextCropSource = URL.createObjectURL(file);
    setCropSource(nextCropSource);
    setIsCropOpen(true);
    resetCropState();
  };

  const handleCropSave = async () => {
    const image = cropImageRef.current;
    const metrics = getCropRenderMetrics(CROPPED_IMAGE_SIZE);

    if (!image || !metrics) {
      toast.error("Image is still loading.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = CROPPED_IMAGE_SIZE;
    canvas.height = CROPPED_IMAGE_SIZE;

    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Unable to crop image.");
      return;
    }

    context.clearRect(0, 0, CROPPED_IMAGE_SIZE, CROPPED_IMAGE_SIZE);
    context.drawImage(
      image,
      metrics.x,
      metrics.y,
      metrics.width,
      metrics.height,
    );

    try {
      setUploading(true);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) {
        toast.error("Unable to crop image.");
        return;
      }

      const croppedFile = new File(
        [blob],
        fileInputRef.current?.files?.[0]?.name || "cropped-image.jpg",
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        },
      );

      await uploadCroppedPhoto(croppedFile);
      closeCropModal();
      toast.success("Photo uploaded successfully.");
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error(error?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const cropMetrics = getCropRenderMetrics();

  if (loading) {
    return (
      <div className="w-full mt-6 h-72 flex items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={34} />
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="w-full mt-6 mx-auto p-8 bg-white rounded-2xl border border-gray-100 text-center text-stone-500 flex flex-col items-center gap-5">
        <p>No photos available in your profile gallery.</p>
        <label className="cursor-pointer px-6 py-3 bg-white border border-stone-800 rounded-full shadow-sm flex items-center gap-3 hover:bg-stone-50 transition-all active:scale-95">
          <span className="text-[#6E2F2F] text-base font-medium">
            {uploading ? "Uploading..." : "Upload new photo"}
          </span>
          <Upload size={18} className="text-[#6E2F2F]" />
          <input
            ref={fileInputRef}
            key={fileInputKey}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUploadPhotos}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="w-full mt-6 mx-auto flex flex-col gap-6 font-inter select-none">
      <div className="flex justify-between items-center max-w-[41%] p-2">
        <button
          type="button"
          disabled={deleting}
          onClick={handleDeleteSelectedPhoto}
          className="cursor-pointer w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-green-700 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Trash2 size={20} />
        </button>

        <div className="text-[#4A8B5F] text-lg font-medium">
          {currentIndex + 1} <span className="text-stone-300">/</span> {photos.length}
        </div>

        {/* <div className="flex items-center gap-2">
          <span className="text-stone-300 text-sm">Selected</span>
          <div className="w-5 h-5 rounded border-2 border-amber-200 bg-[#4A8B5F]/10" />
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 relative w-full aspect-square md:aspect-[4/5] lg:h-[480px]">
          <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-lg">
            <Image
              src={currentPhoto?.url}
              alt="Main Preview"
              fill
              priority
              className="object-cover transition-opacity duration-300"
            />

            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10">
              <button
                type="button"
                onClick={prevImage}
                className="cursor-pointer w-10 h-10 bg-[#4A8B5F]/80 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="cursor-pointer w-10 h-10 bg-[#4A8B5F]/80 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-10 h-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <button
                key={photo._id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`aspect-square relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border-4 ${
                  currentIndex === idx
                    ? "border-[#4A8B5F] scale-105 z-10 shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={photo?.url}
                  fill
                  className="object-cover"
                  alt={`Thumb ${idx + 1}`}
                />
              </button>
            ))}
          </div>

          <div className="mt-auto flex justify-end">
            <label className="cursor-pointer px-8 py-3 bg-white border border-stone-800 rounded-full shadow-sm flex items-center gap-3 hover:bg-stone-50 transition-all active:scale-95">
              <span className="text-[#6E2F2F] text-base font-medium">
                {uploading ? "Uploading..." : "Upload new photo"}
              </span>
              <Upload size={18} className="text-[#6E2F2F]" />
              <input
                ref={fileInputRef}
                key={fileInputKey}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleUploadPhotos}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {isCropOpen && cropSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="flex h-[95%] w-full max-w-md flex-col rounded-[28px] bg-white">
            <div className="border-b px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-medium text-[#2D2424]">
                    Crop Photo
                  </h3>
                  <p className="text-sm text-[#6B5B57]">
                    Adjust the image inside the frame before saving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCropModal}
                  className="cursor-pointer rounded-full bg-[#F7F0ED] p-2 text-[#5D2E26]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="flex justify-center">
                <div
                  className="relative overflow-hidden rounded-[24px] bg-[#EEE5E1]"
                  style={{ width: CROP_BOX_SIZE, height: CROP_BOX_SIZE }}
                >
                  <img
                    ref={cropImageRef}
                    src={cropSource}
                    alt="Crop preview"
                    className="pointer-events-none absolute max-w-none select-none"
                    onLoad={(event) => {
                      setImageDimensions({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                    }}
                    style={
                      cropMetrics
                        ? {
                            width: `${cropMetrics.width}px`,
                            height: `${cropMetrics.height}px`,
                            left: `${cropMetrics.x}px`,
                            top: `${cropMetrics.y}px`,
                          }
                        : undefined
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-[24px] border-2 border-white/90 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.2)]" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D2E26]">
                    Zoom
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#5D2E26]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D2E26]">
                    Move Left / Right
                  </span>
                  <input
                    type="range"
                    min={-(cropMetrics?.maxOffsetX ?? 0)}
                    max={cropMetrics?.maxOffsetX ?? 0}
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="w-full accent-[#5D2E26]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D2E26]">
                    Move Up / Down
                  </span>
                  <input
                    type="range"
                    min={-(cropMetrics?.maxOffsetY ?? 0)}
                    max={cropMetrics?.maxOffsetY ?? 0}
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="w-full accent-[#5D2E26]"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 border-t p-3">
              <button
                type="button"
                onClick={closeCropModal}
                className="flex-1 rounded-full border border-[#D7C2BA] px-4 py-3 text-sm font-medium text-[#5D2E26]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                disabled={uploading}
                className="flex-1 rounded-full bg-[#5D2E26] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Apply Crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPhotoGallery;
