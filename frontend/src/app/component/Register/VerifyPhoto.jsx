"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Check,
  ChevronRight,
  Camera,
  Shield,
  Loader2,
  X,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

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

const VerifyPhoto = ({ data, onChange, profileCreatedFor, onNext }) => {
  const [isUploading, setIsUploading] = useState({ photo: false, id: false });
  const [status, setStatus] = useState({
    photo: !!data.verificationSelfieUrl,
    id: !!data.idProofUrl,
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const cameraInputRef = useRef(null);
  const idInputRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const streamRef = useRef(null);
  const possessiveLabel = getPossessiveLabel(profileCreatedFor);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const uploadFile = async (file, type) => {
    if (!file) return false;

    setIsUploading((prev) => ({ ...prev, [type]: true }));
    const formData = new FormData();
    formData.append("images", file);

    try {
      // Calling your existing backend API
      const response = await api.post(
        "/photos/upload-photos",
        formData,
        "private",
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.success) {
        const uploadedUrl = response.photos[0].url;

        if (type === "photo") {
          onChange("verificationSelfieUrl", uploadedUrl);
          setStatus((prev) => ({ ...prev, photo: true }));
        } else {
          onChange("idProofUrl", uploadedUrl);
          setStatus((prev) => ({ ...prev, id: true }));
        }
        toast.success(
          `${type === "photo" ? "Selfie" : "ID"} uploaded successfully!`,
        );
        return true;
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading((prev) => ({ ...prev, [type]: false }));
    }

    return false;
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    await uploadFile(file, type);

    if (e.target) {
      e.target.value = "";
    }
  };

  const openLiveSelfie = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      setIsCameraStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Camera access error:", error);
      cameraInputRef.current?.click();
    } finally {
      setIsCameraStarting(false);
    }
  };

  useEffect(() => {
    if (!isCameraOpen || !videoPreviewRef.current || !streamRef.current) {
      return;
    }

    videoPreviewRef.current.srcObject = streamRef.current;
    videoPreviewRef.current
      .play()
      .catch((error) => console.error("Preview play error:", error));
  }, [isCameraOpen]);

  const closeDesktopCamera = () => {
    setIsCameraOpen(false);
    stopCamera();
  };

  const captureDesktopPhoto = async () => {
    const video = videoPreviewRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const file = await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        resolve(
          new File([blob], "verification-selfie.jpg", { type: "image/jpeg" }),
        );
      }, "image/jpeg", 0.95);
    });

    if (!file) {
      toast.error("Could not capture the photo. Please try again.");
      return;
    }

    const didUpload = await uploadFile(file, "photo");

    if (didUpload) {
      closeDesktopCamera();
    }
  };

  const styles = {
    textMain: "#5D2E26",
    textGreen: "#429466",
    bgTag: "#FFF6EC",
  };

  return (
    // ADDED flex flex-col and min-h-full here to prevent cropping and push the button down
    <div className="flex flex-col w-full max-sm:py-20 font-sans max-sm:px-4 min-h-full">
      {/* Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        capture="user"
        ref={cameraInputRef}
        onChange={(e) => handleUpload(e, "photo")}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={idInputRef}
        onChange={(e) => handleUpload(e, "id")}
        className="hidden"
      />

      {/* Header Section */}
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" fill="#D4AF37" />
          <h2
            className="text-2xl font-serif font-bold"
            style={{ color: styles.textMain }}
          >
            Build Trust
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Verified profiles receive 3x more responses
        </p>
      </div>

      {/* Main Action Card (Photo Verification) */}
      <div
        className={`bg-white rounded-2xl p-6 shadow-sm border-2 mb-8 transition-all shrink-0 ${
          status.photo ? "border-green-500" : "border-[#5D2E26]"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status.photo ? "bg-green-500" : "bg-[#C19D6B]"
              }`}
            ></span>
            <span
              className={`text-xs font-bold tracking-wider uppercase ${
                status.photo ? "text-green-600" : "text-[#C19D6B]"
              }`}
            >
              {status.photo ? "Uploaded" : "Recommended"}
            </span>
          </div>
          {status.photo && <Check className="text-green-600 w-5 h-5" />}
        </div>

        <h3
          className="text-2xl font-serif mb-4"
          style={{ color: status.photo ? styles.textGreen : styles.textMain }}
        >
          {status.photo
            ? `${possessiveLabel} Photo Uploaded`
            : `Verify ${possessiveLabel} photo`}
        </h3>

        <ul className="space-y-3 mb-6">
          {[
            "Unlock chat access",
            "Increase response rate",
            "Build credibility",
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <Check
                className="w-5 h-5"
                style={{ color: "#8B4513" }}
                strokeWidth={3}
              />
              <span className="text-[#4A4A4A] text-[15px] font-medium">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={openLiveSelfie}
          disabled={isUploading.photo || isCameraStarting}
          className="w-full py-3.5 rounded-full border border-[#5D2E26] flex items-center justify-center gap-2 text-[#5D2E26] font-medium hover:bg-[#FFFBF5] cursor-pointer transition-colors disabled:opacity-50"
        >
          {isUploading.photo || isCameraStarting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
          {status.photo
            ? `Retake ${possessiveLabel} live selfie`
            : `Click ${possessiveLabel} live selfie`}
        </button>
      </div>

      {/* Available Verifications (Government ID) */}
      <div className="shrink-0 pb-4">
        <h4 className="text-sm text-gray-500 mb-3">Available Verifications</h4>
        <div className="space-y-3">
          <div
            onClick={() => idInputRef.current.click()}
            className={`bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all border ${status.id ? "border-green-200" : "border-transparent"}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F3E5DC] flex items-center justify-center shrink-0">
                {isUploading.id ? (
                  <Loader2 className="animate-spin text-[#5D2E26]" />
                ) : (
                  <Shield className="w-5 h-5 text-[#5D2E26]" />
                )}
              </div>
              <div>
                <p className="font-bold text-[#2D2424]">Government ID</p>
                <p className="text-xs text-[#7B6A64]">
                  Upload a clear image or PDF of Aadhaar, PAN, or Passport.
                </p>
                {status.id && (
                  <p className="text-xs text-green-600 font-medium">
                    Uploaded Successfully
                  </p>
                )}
              </div>
            </div>
            {status.id ? (
              <Check className="text-green-600 w-5 h-5 shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Desktop Next Button (Explore Matches) */}
      <div className="w-full pb-16 mt-10 max-sm:hidden">
        <button
          onClick={onNext}
          className="w-full py-5 px-14 md:px-30 rounded-full font-inter font-medium md:text-[18px] text-center text-[#2d2424] shadow-lg transition-all active:scale-95 hover:shadow-xl cursor-pointer"
          style={{
            background:
              "linear-gradient(99.44deg, #E3B450 2.09%, #F6DC7F 40.67%, #CAA043 92.25%)",
          }}
        >
          Explore Matches
        </button>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#5D2E26]">
                  Take a Live Photo
                </h3>
                <p className="text-sm text-gray-500">
                  Position the face clearly and capture the selfie.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDesktopCamera}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7D8C9] text-[#5D2E26] transition hover:bg-[#FFF6EC]"
                aria-label="Close camera"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-[24px] bg-[#1B1B1B]">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="h-[260px] w-full bg-black object-cover sm:h-[420px]"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={captureDesktopPhoto}
                disabled={isUploading.photo}
                className="flex-1 rounded-full bg-[#5D2E26] px-6 py-3.5 font-medium text-white transition hover:bg-[#4a241d] disabled:opacity-50"
              >
                {isUploading.photo ? "Uploading..." : "Capture Photo"}
              </button>
              <button
                type="button"
                onClick={closeDesktopCamera}
                className="flex-1 rounded-full border border-[#5D2E26] px-6 py-3.5 font-medium text-[#5D2E26] transition hover:bg-[#FFF6EC]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyPhoto;
