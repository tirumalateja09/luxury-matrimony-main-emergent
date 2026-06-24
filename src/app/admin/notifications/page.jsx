"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CreditCard,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
} from "lucide-react";

const timeAgo = (date) => {
  if (!date) return "Recently";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) return `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return "Yesterday";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return "1 hour ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  return "Just now";
};

const formatNotificationType = (type) => {
  if (!type) return "General Notification";

  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getIcon = (type) => {
  switch (type) {
    case "approval_request":
      return <Bell size={18} />;
    case "interest_received":
    case "interest_accepted":
      return <Heart size={18} />;
    case "profile_view":
      return <Eye size={18} />;
    case "message":
      return <MessageCircle size={18} />;
    case "subscription":
      return <CreditCard size={18} />;
    default:
      return <Bell size={18} />;
  }
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPageParam = Number(searchParams.get("page") || "1");
  const initialPage =
    Number.isFinite(initialPageParam) && initialPageParam > 0
      ? initialPageParam
      : 1;

  const [token, setToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const PAGE_SIZE = 20;

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

  const fetchNotifications = useCallback(
    async (authToken, nextPage = 1) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        params.set("limit", String(PAGE_SIZE));

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/notifications?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            handleUnauthorized();
            return;
          }
          throw new Error(
            data?.message || "Failed to fetch admin notifications",
          );
        }

        setNotifications(Array.isArray(data?.data) ? data.data : []);
        setPage(data?.currentPage || nextPage);
        setTotalPages(data?.totalPages || 1);
        setTotalNotifications(data?.totalNotifications || 0);
      } catch (err) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [handleUnauthorized],
  );

  useEffect(() => {
    if (!token || page < 1) return;
    fetchNotifications(token, page);
  }, [token, page, fetchNotifications]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [page, pathname, router]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="mx-auto container rounded-2xl border border-[#EEE4D8] bg-white p-5 md:p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-playfair text-[#2D2424]">
              Notifications
            </h1>
            <p className="text-gray-500">
              Recent admin notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchNotifications(token, page)}
              className="rounded-full border border-[#D7C2A7] px-4 py-2 text-sm font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] transition cursor-pointer"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-full border border-[#D7C2A7] px-4 py-2 text-sm font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] transition cursor-pointer"
            >
              Home
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#2D5F3F]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E7DCCF] bg-[#FCFAF7] px-6 py-16 text-center">
            <p className="text-lg font-playfair text-[#2D2424]">
              No notifications found
            </p>
            <p className="mt-2 text-sm text-stone-500">
              New admin activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item, index) => {
              const senderName =
                item?.senderId?.fullName ||
                item?.senderId?.name ||
                item?.senderId?.email ||
                "System";

              return (
                <div
                  key={item?._id || `admin-notification-${index}`}
                  className={`rounded-2xl border p-4 shadow-sm transition ${
                    item?.isRead
                      ? "border-[#F2E9DE] bg-white"
                      : "border-[#F0D9B6] bg-[#FFF9F0]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        item?.isRead ? "bg-[#F8EFE5]" : "bg-gold-gradient"
                      }`}
                    >
                      <span className="text-[#6E2F2F]">
                        {getIcon(item?.type)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-base font-semibold text-[#2D2424]">
                            {item?.title || "Notification"}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            {item?.message || "No message available"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!item?.isRead && (
                            <span className="h-2.5 w-2.5 rounded-full bg-[#C48B2D]" />
                          )}
                          <span className="text-xs uppercase tracking-wider text-stone-400">
                            {timeAgo(item?.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        <span className="rounded-full bg-[#FBF6ED] px-3 py-1 font-medium text-[#6E2F2F]">
                          {formatNotificationType(item?.type)}
                        </span>
                        <span>From: {senderName}</span>
                        {item?.type === "approval_request" && item?.relatedId && (
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/user/${item.relatedId}`)}
                            className="rounded-full border border-[#D7C2A7] px-3 py-1 font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] transition cursor-pointer"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {page} of {Math.max(totalPages, 1)}
            {totalNotifications > 0
              ? ` | ${totalNotifications} total notifications`
              : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1))
              }
              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
