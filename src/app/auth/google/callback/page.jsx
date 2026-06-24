"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const STORAGE_KEY = "rvr_auth_data";

const parseBoolean = (value) => {
  if (typeof value !== "string") return false;
  return value.toLowerCase() === "true" || value === "1";
};

const parseJsonValue = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
};

function GoogleCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token =
      searchParams.get("token") ||
      searchParams.get("authToken") ||
      searchParams.get("accessToken");
    const rawUser =
      searchParams.get("user") ||
      searchParams.get("userData") ||
      searchParams.get("profile");
    const rawAuthData = searchParams.get("authData");
    const error =
      searchParams.get("error") || searchParams.get("message") || null;
    const redirect = searchParams.get("redirect") || "/home";
    const isNewUser = parseBoolean(searchParams.get("isNewUser"));

    if (error) {
      toast.error(error);
      router.replace(
        redirect === "/home"
          ? "/login"
          : `/login?redirect=${encodeURIComponent(redirect)}`,
      );
      return;
    }

    if (rawAuthData) {
      const parsedAuthData = parseJsonValue(rawAuthData);

      if (parsedAuthData?.token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedAuthData));
        router.replace(
          parseBoolean(String(parsedAuthData?.isNewUser))
            ? "/profiledetails/step1"
            : redirect,
        );
        return;
      }
    }

    if (!token) {
      toast.error("Google login failed. Please try again.");
      router.replace(
        redirect === "/home"
          ? "/login"
          : `/login?redirect=${encodeURIComponent(redirect)}`,
      );
      return;
    }

    const user = parseJsonValue(rawUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    router.replace(isNewUser ? "/profiledetails/step1" : redirect);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <p className="text-sm font-medium text-[#2D2424]">
        Completing Google login...
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackPageContent />
    </Suspense>
  );
}
