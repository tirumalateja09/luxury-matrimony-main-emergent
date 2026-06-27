"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import UserDetailPanel from "@/app/component/Admin/UserDetailPanel";

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.slug;
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      router.push("/adminlogin");
      return;
    }

    setToken(savedToken);
  }, [router]);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("adminToken");
    router.push("/adminlogin");
  }, [router]);

  const fetchUserDetails = useCallback(
    async (authToken) => {
      if (!authToken || !profileId) return;

      setLoading(true);
      setError("");

      try {
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/user-details/profile/${profileId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          },
        );
     

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.success) {
          if (res.status === 401 || res.status === 403) {
            handleUnauthorized();
            return;
          }

          throw new Error(data?.message || "Failed to fetch user details.");
        }

        setUser(data?.data || null);
      } catch (err) {
        setError(err?.message || "Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized, profileId],
  );

  useEffect(() => {
    if (!token) return;
    fetchUserDetails(token);
  }, [fetchUserDetails, token]);

  const handleVerify = async (nextProfileId, status) => {
    if (status === "rejected" && !remarks.trim()) {
      toast.error("Please provide remarks for the rejection.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/verify-profile/${nextProfileId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, remarks }),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
          return;
        }

        throw new Error(data?.message || "Verification failed.");
      }

      toast.success(`Profile has been ${status} successfully.`);
      setRemarks("");
      fetchUserDetails(token);
    } catch (err) {
      toast.error(err?.message || "Verification failed.");
    }
  };

  const handleAccountStatusChange = async (userId, accountStatus) => {
    if (!userId || !token) {
      toast.error("Unable to update account status.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/admin/users/${userId}/account-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ accountStatus }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
        throw new Error(data?.message || "Failed to update account status.");
      }
      toast.success(accountStatus === "active" ? "User account activated." : "User account blocked.");
      fetchUserDetails(token);
    } catch (err) {
      toast.error(err?.message || "Failed to update account status.");
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    if (!userId || !token || !newPassword) return;
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API}/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Reset failed");
      toast.success("Password reset. Email sent to user.");
    } catch (err) {
      toast.error(err?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="font-playfair text-3xl font-bold text-[#2D2424]">
            User Details
          </h1>
          <p className="text-gray-500">
            Review complete account, profile, subscription and verification data.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#F2E9DE] bg-white p-10 text-center text-gray-500 shadow-sm">
            Loading user details...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : user ? (
          <UserDetailPanel
            user={user}
            remarks={remarks}
            onRemarksChange={setRemarks}
            onVerify={handleVerify}
            onAccountStatusChange={handleAccountStatusChange}
            onResetPassword={handleResetPassword}
            showBackButton
            onBack={() => router.push("/admin")}
          />
        ) : (
          <div className="rounded-2xl border border-[#F2E9DE] bg-white p-10 text-center text-gray-500 shadow-sm">
            User details not found.
          </div>
        )}
      </div>
    </div>
  );
}
