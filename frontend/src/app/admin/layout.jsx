"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { AdminProvider, useAdminContext } from "@/context/AdminContext";
import AdminSidebar from "@/app/component/Admin/AdminSidebar";

// Inner component can use context since it's wrapped by AdminProvider
function AdminLayoutInner({ children }) {
  const router = useRouter();
  const { updateAdmin, clearAdmin } = useAdminContext();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      clearAdmin();
      setIsAuthorized(false);
      setIsAuthChecking(false);
      router.replace("/adminlogin");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/token-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await res.json().catch(() => ({}));
      const isValid = response?.success && response?.valid && !response?.expired;
      if (!isValid) {
        clearAdmin();
        setIsAuthorized(false);
        setIsAuthChecking(false);
        router.replace("/adminlogin");
        return;
      }
      // Store role + name from token-status response
      updateAdmin(response.role || "admin", response.adminName || "", response.adminId || "");
      setIsAuthorized(true);
    } catch {
      clearAdmin();
      setIsAuthorized(false);
      router.replace("/adminlogin");
    } finally {
      setIsAuthChecking(false);
    }
  }, [router, updateAdmin, clearAdmin]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isAuthChecking || !isAuthorized) return null;

  return (
    <div className="min-h-screen flex bg-[#FAF8F5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#F2E9DE] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#6E2F2F] hover:bg-[#FBF6ED] transition"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-playfair font-bold text-[#2D2424] text-base">Admin Panel</span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
