"use client";

import React, { useState } from "react";
import { ChevronLeft, Loader2, Lock, Trash2, AlertTriangle, X } from "lucide-react";
import MobileHeaderText from "@/app/component/MobileHeaderText";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmNewPassword.trim();

    if (!trimmedPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (trimmedPassword !== trimmedConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(
        "/auth/password",
        { newPassword: trimmedPassword },
        "private",
      );
      if (response?.success) {
        toast.success(response?.message || "Password updated");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(response?.message || "Failed to update password");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const response = await api.delete("/profile/me", "private");
      if (response?.success) {
        toast.success("Profile deleted successfully");
        localStorage.removeItem("rvr_auth_data");
        sessionStorage.removeItem("registerData");
        router.push("/");
      } else {
        toast.error(response?.message || "Failed to delete profile");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to delete profile");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-40 sm:mb-0">
      <MobileHeaderText>
        <div className="flex items-center gap-2">
          <Lock size={18} />
          Settings
        </div>
      </MobileHeaderText>
<div className="px-4 sm:px-0">
      <div className="hidden sm:block w-full">
        <div className="w-full min-h-[80px] md:h-24 px-4 md:px-6 py-4 bg-[#F3DED3] rounded-[20px] flex flex-row justify-between items-center gap-4 transition-all">
          <button
            onClick={() => window.history.back()}
            className="h-10 px-4 py-2 rounded-full cursor-pointer hover:shadow flex items-center gap-2 hover:bg-stone-50 active:scale-95 transition-all group"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-stone-500 text-sm font-normal font-inter">
              Back
            </span>
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-green-600 text-lg md:text-2xl font-semibold font-playfair leading-tight">
              Settings
            </h1>
          </div>

          <div className="w-16 md:w-20" />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[24px] border border-gray-100 shadow-md p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold text-stone-800 mb-6">
          Update Password
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-red-900 text-sm font-semibold font-inter">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-red-900 text-sm font-semibold font-inter">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-12 px-4 bg-white rounded-3xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-900/15"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 cursor-pointer h-12 px-6 rounded-full bg-red-900 text-white font-semibold text-sm shadow-sm hover:bg-red-800 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-50/50 rounded-[24px] border border-red-100 p-6 md:p-8 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h2 className="text-xl md:text-2xl font-bold text-red-900">
            Danger Zone
          </h2>
        </div>
        <p className="text-stone-600 mb-6 text-sm md:text-base">
          Once you delete your profile, there is no going back. This will
          permanently remove your account, messages, and all associated data.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-all cursor-pointer shadow-sm"
        >
          <Trash2 size={18} />
          Delete My Profile
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute right-6 top-6 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-red-100 p-4 rounded-full">
                <Trash2 className="text-red-600" size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-stone-800">Are you sure?</h3>
                <p className="text-stone-500">
                  This action is permanent and cannot be undone. All your matches, messages, and profile data will be lost forever.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 mt-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full h-14 bg-red-600 text-white rounded-full font-bold text-lg hover:bg-red-700 transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Deleting Account...
                    </>
                  ) : (
                    "Yes, Delete My Profile"
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full h-14 bg-stone-100 text-stone-600 rounded-full font-bold text-lg hover:bg-stone-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}</div>
    </div>
  );
}
