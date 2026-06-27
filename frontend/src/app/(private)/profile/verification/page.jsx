"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Phone,
  Check,
  ChevronLeft,
  Sparkles,
  Shield,
} from "lucide-react";
import VerifyPhotoCard from "@/app/component/Private/VerifyPhotoCard";
import MobileHeaderText from "@/app/component/MobileHeaderText";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

const page = () => {
  const idInputRef = useRef(null);
  const [adminStatus, setAdminStatus] = useState("");
  const [idProofUrl, setIdProofUrl] = useState("");
  const [isUploadingId, setIsUploadingId] = useState(false);

  useEffect(() => {
    const fetchProfileSummary = async () => {
      try {
        const response = await api.get("/profile/summary", "private");
        if (response?.success) {
          setAdminStatus(
            response?.data?.adminStatus ||
              response?.data?.profile?.adminStatus ||
              ""
          );
        }
      } catch (error) {
        console.error("Error fetching profile summary:", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/me", "private");
        if (response?.success) {
          const profile = response?.data?.profile || {};
          setIdProofUrl(profile.idProofUrl || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfileSummary();
    fetchProfile();
  }, []);

  const uploadIdFile = async (file) => {
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

  const handleUploadIdProof = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingId(true);
      const uploadResponse = await uploadIdFile(file);
      const uploadedUrl =
        uploadResponse?.photos?.[0]?.url ||
        uploadResponse?.data?.photos?.[0]?.url;

      if (!uploadedUrl) {
        throw new Error("ID upload failed");
      }

      const updateResponse = await api.put(
        "/profile/update",
        { idProofUrl: uploadedUrl },
        "private"
      );

      if (updateResponse?.success) {
        setIdProofUrl(uploadedUrl);
        toast.success("Government ID uploaded.");
      }
    } catch (error) {
      console.error("ID proof upload failed:", error);
      toast.error(error?.message || "Failed to upload ID proof.");
    } finally {
      setIsUploadingId(false);
      if (idInputRef.current) {
        idInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <input
        ref={idInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleUploadIdProof}
        className="hidden"
      />
      <div className="w-full hidden sm:block">
        <div className="w-full min-h-[80px] md:h-24 px-4 md:px-6 py-4 bg-[#F3DED3] rounded-[20px] flex flex-row justify-between items-center gap-4 transition-all">
          {/* Left: Back Button */}
          <button
            onClick={() => window.history.back()}
            className="h-10 px-4 py-2  rounded-full cursor-pointer hover:shadow flex items-center gap-2 hover:bg-stone-50 active:scale-95 transition-all group"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-stone-500 text-sm font-normal font-sans">
              Back
            </span>
          </button>

          {/* Center: Page Title */}
          <div className="flex-1 text-center">
            <h1 className="text-[#429466] text-lg md:text-2xl font-semibold font-playfair leading-tight">
              Verification Status
            </h1>
          </div>

          {/* Right: Spacer for centering (balances the back button) */}
          <div className="hidden sm:block w-[88px]" aria-hidden="true" />
        </div>
      </div>
      <MobileHeaderText>
        <div className="flex items-center gap-2">Verification Status</div>
      </MobileHeaderText>
      <div className="w-full flex flex-col py-8 gap-8 px-4 sm:px-0">
        {/* 1. Header Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400 w-8 h-8" />
            <h2
              className="text-3xl font-semibold font-playfair 
bg-gradient-to-r from-[#E3B450] via-[#F6DC7F] to-[#CAA043] 
bg-clip-text text-transparent"
            >
              Build Trust
            </h2>
          </div>

          {/* Responsive Progress Bar */}
          <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-[#429466] rounded-full transition-all duration-500" />
          </div>

          <p className="text-[#7B6A64] text-lg">
            Verified profiles receive 3x more responses
          </p>
        </div>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Recommended Card (Left) */}
          <div className="lg:col-span-5">
            <VerifyPhotoCard />
    
          </div>

          {/* Verifications List (Right) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Completed Section */}
            <div className="space-y-3">
              <span className="text-stone-500 text-sm font-bold uppercase tracking-wider">
                Completed
              </span>
              <div className="p-4 bg-white rounded-2xl shadow-md flex justify-between items-center border border-stone-100 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                    <Phone className="text-stone-800 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-stone-800 text-lg font-medium">
                      Phone Verified
                    </h4>
                    {/* <p className="text-stone-500 text-sm">+91 **** **56</p> */}
                  </div>
                </div>
                <Check className="text-green-600 w-6 h-6" strokeWidth={3} />
              </div>
            </div>

            {/* Available Section */}
            {adminStatus?.toLowerCase() !== "approved" && (
              <div className="space-y-3">
                <span className="text-stone-500 text-sm font-bold uppercase tracking-wider">
                  Available Verifications
                </span>
                <div className="flex flex-col gap-4">
                  {/* Government ID Item */}
                  <div className="p-4 bg-white rounded-2xl shadow-md flex justify-between items-center border border-stone-100 hover:bg-stone-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <Shield className="text-stone-800 w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-stone-800 text-lg font-medium">
                          Government ID
                        </h4>
                        <p className="text-xs text-[#7B6A64]">
                          Upload a clear image or PDF of Aadhaar, PAN, or Passport.
                        </p>
                        {idProofUrl && (
                          <p className="text-xs text-green-700 mt-1 break-all">
                            Government ID uploaded successfully.
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => idInputRef.current?.click()}
                      disabled={isUploadingId}
                      className="ml-4 px-4 py-2 rounded-full border border-red-900 text-red-900 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUploadingId ? "Uploading..." : "Upload"}
                    </button>
                  </div>

                {/* Family Verification Item */}
                {/* <div className="p-4 bg-white rounded-2xl shadow-md flex justify-between items-center border border-stone-100 hover:bg-stone-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                      <Users className="text-stone-800 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-stone-800 text-lg font-medium">
                        Family Verification
                      </h4>
                      <p className="text-stone-500 text-sm">
                        Verify with parent/guardian
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-stone-400 w-6 h-6" />
                </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>{" "}
    </div>
  );
};

export default page;
