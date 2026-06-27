"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, Check, CircleCheckBig, Loader2, Shield } from "lucide-react";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

const VerifyPhotoCard = ({ isIcon = false }) => {
  const cameraInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selfieUrl, setSelfieUrl] = useState("");

  useEffect(() => {
  const fetchProfileStatus = async () => {
    try {
      const response = await api.get("/profile/me", "private");

      if (!response?.success) return;

      const profile = response?.data?.profile ?? {};
      const existingSelfie = profile?.verificationSelfieUrl ?? "";

      setSelfieUrl(existingSelfie);

      const isApproved =
        !!existingSelfie && profile?.adminStatus === "approved";

      setIsVerified(isApproved);
    } catch (error) {
      console.error("Error fetching verification status:", error);
    }
  };

  fetchProfileStatus();
}, []);
  const uploadSelfieFile = async (file) => {
    const formData = new FormData();
    formData.append("images", file);

    try {
      return await api.postFile("/profile/upload-photos", formData, "private");
    } catch {
      try {
        return await api.postFile("/photos/upload-photos", formData, "private");
      } catch {
        return await api.postFile("/upload-photos", formData, "private");
      }
    }
  };

  const handleVerifyPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadResponse = await uploadSelfieFile(file);
      const uploadedUrl =
        uploadResponse?.photos?.[0]?.url ||
        uploadResponse?.data?.photos?.[0]?.url;

      if (!uploadedUrl) {
        throw new Error("Photo upload failed");
      }

      const updateResponse = await api.put(
        "/profile/update",
        { verificationSelfieUrl: uploadedUrl },
        "private"
      );

      if (updateResponse?.success) {
        setSelfieUrl(uploadedUrl);
        setIsVerified(true);
      }
    } catch (error) {
      console.error("Selfie verification failed:", error);
      toast.error(error?.message || "Failed to verify photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={`p-6 bg-white rounded-2xl shadow-xl border-2 flex flex-col gap-6 ${
        isVerified ? "border-green-600" : "border-red-900"
      }`}
    >
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleVerifyPhoto}
        className="hidden"
      />

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 opacity-70">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              isVerified ? "bg-green-600" : "bg-red-900"
            }`}
          />
          <span
            className={`text-xs font-bold uppercase tracking-widest ${
              isVerified ? "text-green-600" : "text-red-900"
            }`}
          >
            {isVerified ? "Verified" : "Recommended"}
          </span>
        </div>

        {isIcon && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 px-2 py-2 bg-gold-gradient rounded-full">
              <CircleCheckBig className="w-4 h-4 text-[#6E2F2F]" />
            </div>
            <div className="flex items-center gap-2 px-2 py-2 bg-gold-gradient rounded-full">
              <Shield className="w-4 h-4 text-[#6E2F2F]" />
            </div>
          </div>
        )}
      </div>

      <h3 className="text-[#429466] text-2xl font-semibold font-playfair">
        {isVerified ? "Photo verified" : "Verify your photo"}
      </h3>

      <ul className="space-y-2">
        {[
          "Unlock chat access",
          "Increase response rate",
          "Build credibility",
        ].map((text, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
              <Check className="text-red-900 w-3 h-3" strokeWidth={3} />
            </div>
            <span className="text-stone-800 text-lg">{text}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={isUploading}
        className="cursor-pointer w-full py-3 bg-white rounded-full shadow-lg border border-red-900 flex justify-center items-center gap-3 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-red-900 animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-red-900" />
        )}
        <span className="text-red-900 text-base font-medium">
          {isUploading
            ? "Uploading..."
            : isVerified
              ? "Retake Verification Photo"
              : "Verify Photo Now"}
        </span>
      </button>

      {isVerified && (
        <p className="text-xs text-green-700 break-all">
          Verified selfie uploaded successfully.
       
        </p>
      )}
    </div>
  );
};

export default VerifyPhotoCard;
