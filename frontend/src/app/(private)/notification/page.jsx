"use client";
import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  CreditCard,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/apiClient";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Manual Time Ago Logic
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "Yesterday";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    return "Just now";
  };

  // 2. Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications", "private");
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 3. Mark Single as Read API
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const response = await api.put(
        `/notifications/${id}/read`,
        {},
        "private",
      );
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // 4. Mark All as Read API
  const handleMarkAllRead = async () => {
    try {
      const response = await api.put(
        "/notifications/mark-all-read",
        {},
        "private",
      );
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  // 5. Delete Notification API
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this notification?")) return;
    try {
      const response = await api.delete(`/notifications/${id}`, "private");
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "interest_received":
        return <Heart size={20} />;
      case "interest_accepted":
        return <Check size={20} />;
      case "profile_view":
        return <Eye size={20} />;
      case "message":
        return <MessageCircle size={20} />;
      case "subscription":
        return <CreditCard size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen bg-white sm:bg-transparent flex flex-col  px-4 lg:px-0">
      {/* Header with Mark All Button */}
      <div className="w-full pt-3 pb-3 border-b border-gray-100 flex items-center justify-between bg-white sm:bg-transparent z-10">
        <div className="flex items-center gap-4">
          <div
            onClick={() => window.history.back()}
            className="w-10 h-10 sm:hidden cursor-pointer bg-green-600/10 rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="text-green-600" />
          </div>
          <h1 className="text-green-600 text-xl sm:text-3xl font-semibold font-playfair">
            Notifications
          </h1>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-green-600 hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4 mt-4 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-green-600" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
              className={`group cursor-pointer w-full p-4 rounded-2xl border flex justify-between items-start gap-3 transition-all ${
                !notif.isRead
                  ? "bg-orange-50 border-orange-100 shadow-sm"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${!notif.isRead ? "bg-gold-gradient" : "bg-red-50"}`}
                >
                  <span className="text-red-900">{getIcon(notif.type)}</span>
                </div>
                <div className="flex flex-col">
                  <p
                    className={`${!notif.isRead ? "text-red-900 font-bold" : "text-stone-800 font-medium"} text-sm`}
                  >
                    {notif.title}
                  </p>
                  <p className="text-stone-600 text-xs mt-0.5">
                    {notif.message}
                  </p>
                  <span className="text-stone-400 text-[10px] mt-1 italic uppercase tracking-wider">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-gold-gradient rounded-full animate-pulse" />
                )}
                <button
                  onClick={(e) => handleDelete(e, notif._id)}
                  className="p-1 sm:opacity-0 cursor-pointer sm:group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-800 font-playfair text-xl">
            Inbox is empty
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
