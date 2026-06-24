"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/apiClient";
import ProfileDetailView from "@/app/component/ProfileDetailView";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = Array.isArray(params?.userId) ? params.userId[0] : params?.userId;
  const isSelfView = searchParams.get("self") === "1";
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [userRes, summaryRes] = await Promise.all([
          api.get(`/profile/user/${userId}`, "private"),
          api.get("/profile/summary", "private"),
        ]);

        if (userRes?.success) {
          setUser(userRes.data);
        } else {
          setError("Unable to load profile details.");
        }

        if (summaryRes?.success) {
          setSummary(summaryRes.data);
        }
      } catch (fetchError) {
        console.error("Error fetching user profile:", fetchError);
        setError(fetchError?.message || "Unable to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-700" size={40} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-lg font-semibold text-[#2A1D1D]">
          {error || "Profile not found."}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-[#6E2F2F] px-5 py-2 text-sm font-medium text-[#6E2F2F]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <ProfileDetailView
      ismatch={!isSelfView}
      user={user}
      summary={summary}
      onBack={() => router.back()}
    />
  );
}
