"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

const CROP_BOX_SIZE = 280;
const CROPPED_IMAGE_SIZE = 1080;

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const getPossessiveLabel = (value) => {
  switch (value) {
    case "Myself":
      return "Your";
    case "Daughter":
      return "Daughter's";
    case "Son":
      return "Son's";
    case "Sister":
      return "Sister's";
    case "Brother":
      return "Brother's";
    case "Relative":
      return "Relative's";
    case "Friend":
      return "Friend's";
    default:
      return "Your";
  }
};

// Added onNext prop here
const UploadPhoto = ({ data, onChange, profileCreatedFor, onNext }) => {
  const [preview, setPreview] = useState(data.photoUrl || null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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
  const possessiveLabel = getPossessiveLabel(profileCreatedFor);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      if (cropSource?.startsWith("blob:")) {
        URL.revokeObjectURL(cropSource);
      }
    };
  }, [preview, cropSource]);

  useEffect(() => {
    if (!file && data.photoUrl !== preview) {
      setPreview(data.photoUrl || null);
    }
  }, [data.photoUrl, file, preview]);

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const nextCropSource = URL.createObjectURL(selectedFile);
      setFile(null);
      setCropSource(nextCropSource);
      setIsCropOpen(true);
      resetCropState();
    }
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

    canvas.toBlob(
      (blob) => {
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

        if (preview?.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }

        const nextPreview = URL.createObjectURL(croppedFile);
        setPreview(nextPreview);
        setFile(croppedFile);
        onChange("photoUrl", nextPreview);
        closeCropModal();
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleFinalUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const uploadData = new FormData();
    uploadData.append("images", file);
    uploadData.append("isMain", "true");

    try {
      const response = await api.postFile(
        "/profile/upload-photos",
        uploadData,
        "private",
      );

      if (response.success) {
        const mainPhoto =
          response.photos?.find((photo) => photo.isMain) ||
          response.photos?.[0];
        const cloudinaryUrl = mainPhoto?.url;

        if (!cloudinaryUrl) {
          throw new Error("Uploaded photo URL not found.");
        }

        setPreview(cloudinaryUrl);
        onChange("photoUrl", cloudinaryUrl);
        toast.success("Photo saved to profile!");
        setFile(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFile(null);
    onChange("photoUrl", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cropMetrics = getCropRenderMetrics();

  return (
    <div className="flex flex-col items-center w-full px-4 py-16 md:py-10 max-w-lg mx-auto font-sans">
      <h2 className="text-[#2D2424] text-lg font-normal mb-8 text-center">
        Add {possessiveLabel} Photo
      </h2>

      <div className="w-full aspect-square max-w-[320px] bg-[#D9D9D9] rounded-[20px] flex items-center justify-center mb-8 relative overflow-hidden">
        {preview ? (
          <div className="relative w-full h-full p-1 bg-white">
            <div className="relative w-full h-full overflow-hidden rounded-[18px]">
              <Image
                src={preview}
                alt="preview"
                fill
                className="object-cover"
              />
              <button
                onClick={removePhoto}
                className="absolute cursor-pointer top-2 right-2 bg-white/80 p-1.5 rounded-full z-10 shadow-sm"
              >
                <X size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full border-[3px] border-[#A0A0A0] flex items-center justify-center opacity-60">
            <div className="w-10 h-10 bg-[#A0A0A0] rounded-[4px]"></div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full space-y-6">
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full cursor-pointer py-3.5 rounded-full border border-[#5D2E26] text-[#5D2E26] text-base font-medium bg-white active:scale-95 transition-all"
        >
          {preview ? "Change Photo" : "Upload Photo"}
        </button>

        {file && (
          <button
            onClick={handleFinalUpload}
            disabled={isUploading}
            className="w-full cursor-pointer py-4 rounded-full font-bold text-lg shadow-lg text-[#2d2424] bg-gradient-to-r from-[#E3B450] to-[#CAA043] active:scale-95 transition-all disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Save Photo"}
          </button>
        )}
      </div>

      {/* <div className="w-full py-4 px-6 mt-8 rounded-2xl border border-[#E4C06E] bg-white">
        <ul className="list-disc list-inside text-[#5D2E26] text-xs space-y-2 marker:text-gray-400">
          <li>Photos are blurred by default</li>
          <li>You control who can view them</li>
        </ul>
      </div> */}

      {/* Desktop Next Button */}
      <div className="hidden md:flex justify-end w-full pb-16 mt-10">
        <button
          onClick={onNext}
          className="w-[174px] md:w-auto py-5 px-14 md:px-30 rounded-full font-inter font-medium md:text-[18px] text-center text-[#2d2424] shadow-lg transition-all active:scale-95 hover:shadow-xl cursor-pointer"
          style={{
            background:
              "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%)",
          }}
        >
          Next
        </button>
      </div>

      {isCropOpen && cropSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full h-[95%] max-w-md rounded-[28px] bg-white flex flex-col">
            {/* HEADER */}
            <div className="py-3 px-4 border-b">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-medium text-[#2D2424]">
                    Crop Photo
                  </h3>
                  <p className=" text-sm text-[#6B5B57]">
                    Adjust the image inside the frame before saving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCropModal}
                  className="rounded-full cursor-pointer bg-[#F7F0ED] p-2 text-[#5D2E26]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 🔥 SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* Image Preview */}
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

              {/* Controls */}
              <div className="mt-6 space-y-4">
                {/* Zoom */}
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

                {/* Move X */}
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

                {/* Move Y */}
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

            {/* FOOTER */}
            <div className="p-3 border-t flex gap-3">
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
                className="flex-1 rounded-full bg-[#5D2E26] px-4 py-3 text-sm font-medium text-white"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;
