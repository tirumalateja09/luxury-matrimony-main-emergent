"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";
import TopHeader from "../component/TopHeader";
import MobileBottomNav from "../component/MobileBottomNav";
import { api } from "@/lib/apiClient";
import { getToken } from "@/function/getToken";

// 1. IMPORT THE PROVIDER
import { FilterProvider } from "@/context/FilterContext";

function DashboardLayoutInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAccountSuspended, setIsAccountSuspended] = useState(false);
  const searchParams = useSearchParams();

  const currentUrl =
    pathname +
    (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const redirectToLogin = () => {
    router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("rvr_auth_data");
    sessionStorage.removeItem("registerData");
    router.replace("/login");
  };


  // Check if we are inside the profile details flow (step1, preferences, verify, etc.)
  const isProfileFlow = pathname.startsWith("/profiledetails");

  // Check if we are specifically on the profile view page
  const isProfileView = pathname === "/profile-view";

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        localStorage.removeItem("rvr_auth_data");
        if (isMounted) {
          setIsAuthorized(false);
          setIsAuthChecking(false);
        }
        redirectToLogin();
        return;
      }

      try {
        let response;
        response = await api.get("/auth/token-status", "private");
        const isValid = response?.success && response?.valid && !response?.expired;

        if (!isValid) {
          localStorage.removeItem("rvr_auth_data");
          if (isMounted) {
            setIsAuthorized(false);
            setIsAuthChecking(false);
          }
          router.replace("/login");
          redirectToLogin();
          return;
        }

        // Check Profile Completeness
        let isProfileComplete = false;
        try {
          const profileResponse = await api.get("/profile/summary", "private");
          const accountStatus =
            profileResponse?.accountStatus || profileResponse?.data?.accountStatus;

          if (accountStatus === "suspended") {
            if (isMounted) {
              setIsAccountSuspended(true);
              setIsAuthorized(true);
            }
            return;
          }

          if (isMounted) {
            setIsAccountSuspended(false);
          }
          isProfileComplete = profileResponse?.success && !!profileResponse?.data?.fullName;
        } catch (profileError) {
          // If profile summary returns 404, it means profile is not yet created/complete
          if (profileError.status === 404) {
            if (isMounted) {
              setIsAccountSuspended(false);
            }
            isProfileComplete = false;
          } else {
            // Re-throw other errors (500, network, etc.) to outer catch
            throw profileError;
          }
        }

        if (!isProfileComplete && !isProfileFlow && !isProfileView) {
          if (isMounted) {
            setIsAuthorized(true);
          }
          router.replace("/profiledetails/step1");
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem("rvr_auth_data");
        if (isMounted) {
          setIsAuthorized(false);
          setIsAccountSuspended(false);
        }
        redirectToLogin();
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, searchParams]);

  if (isAuthChecking || !isAuthorized) {
    return null;
  }

  if (isAccountSuspended) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(127,29,29,0.10),_transparent_42%),linear-gradient(180deg,_#fff8f8_0%,_#fff_48%,_#fff4f4_100%)] px-6 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-[0_30px_80px_rgba(127,29,29,0.12)]">
            <div className="border-b border-red-100 bg-gradient-to-r from-red-50 via-white to-red-50 px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">
                Account Status
              </p>
              <h1 className="mt-3 text-3xl font-bold text-[#2D2424] md:text-4xl">
                Your account is suspended
              </h1>
            </div>

            <div className="grid gap-8 px-8 py-8 md:grid-cols-[1.4fr_0.9fr] md:px-10 md:py-10">
              <div>
                <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-base font-semibold text-red-700">
                  Your account is suspended. Contact our customer support team for assistance.
                </div>
                <p className="mt-5 text-sm leading-7 text-[#6B5B5B]">
                  Access to private features has been temporarily restricted. If you believe this is a mistake or need help restoring access, please contact our customer support with your registered account details.
                </p>
              </div>

              <div className="rounded-3xl border border-[#F2E9DE] bg-[#FAF8F5] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9A7B52]">
                  Support
                </p>
                <p className="mt-4 text-sm leading-7 text-[#5C4C4C]">
                  Contact our customer support team and mention that your account is showing a suspended status.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-8 w-full rounded-full bg-[#7F1D1D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#681414]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    // 2. WRAP EVERYTHING WITH FILTERPROVIDER
    <FilterProvider>
      <div className="flex flex-col h-screen bg-[#FDFCFB]">
        {/* 1. TOP HEADER - Hide if inside profile flow or profile view */}
        {!isProfileFlow && !isProfileView && (
          <header className="hidden lg:block h-20 w-full bg-white border-b border-gray-100 sticky top-0 z-50">
            <TopHeader />
          </header>
        )}

        {/* 2. BELOW HEADER AREA */}
        <div className="flex flex-1  overflow-hidden">
          {/* SIDEBAR - Hide if inside profile flow or profile view */}
          {!isProfileFlow && !isProfileView && (
            <aside className="w-72 hidden lg:block bg-white overflow-y-auto shadow-[10px_0px_20px_0px_rgba(0,0,0,0.10)] z-10">
              <Sidebar />
            </aside>
          )}

          {!isProfileFlow && !isProfileView && (
            <MobileBottomNav />
          )}

          {/* MAIN PAGE CONTENT AREA */}
          <main
            className={`flex-1 overflow-y-auto ${isProfileFlow || isProfileView
              ? "bg-white" // Clean styling for profile steps and profile view
              : "bg-[#fefcf5] lg:p-8  custom-scrollbar" // Normal Dashboard styling
              }`}
          >
            <div>{children}</div>
          </main>
        </div>
      </div>
    </FilterProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
