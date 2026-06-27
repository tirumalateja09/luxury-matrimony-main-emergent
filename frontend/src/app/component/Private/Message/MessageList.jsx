"use client";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation"; // Import hooks
import { matchesData } from "@/app/lib/data";
import { Check, CircleCheck, Clock, X } from "lucide-react";

// --- Internal Data for Sent/Received ---
const statusList = [
  {
    id: 1,
    name: "Priya R.",
    age: 26,
    status: "Accepted",
    image: "/private/home/user1.jpg",
    icon: <CircleCheck className="w-4 h-4 text-green-800 rounded-full " />,
  },
  {
    id: 2,
    name: "Kavya L.",
    age: 25,
    status: "Pending",
    image: "/private/home/user2.png",
    icon: <Clock className="w-4 h-4 text-stone-600" />,
  },
  {
    id: 3,
    name: "Pooja N.",
    age: 28,
    status: "Declined",
    image: "/home/user.png",
    icon: <X className="w-4 h-4" />,
  },
];

const requests = [
  {
    id: 1,
    name: "Meera S.",
    age: 25,
    gradient: "from-rose-100 to-amber-200",
    image: "/private/home/user2.png",
  },
  {
    id: 2,
    name: "Divya K.",
    age: 27,
    gradient: "from-blue-100 to-purple-200",
    image: "/private/home/user3.png",
  },
  {
    id: 3,
    name: "Anjali M.",
    age: 24,
    gradient: "from-green-100 to-teal-200",
    image: "/private/home/user1.jpg",
  },
  {
    id: 4,
    name: "Divya K.",
    age: 27,
    gradient: "from-orange-100 to-rose-200",
    image: "/private/home/user2.png",
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "Accepted":
      return {
        bg: "bg-orange-50",
        text: "text-green-600 font-medium",
        iconBg: "bg-green-600",
        iconColor: "text-white",
      };
    case "Declined":
      return {
        bg: "bg-orange-50",
        text: "text-stone-800 font-normal",
        iconColor: "text-stone-800",
      };
    default:
      return {
        bg: "bg-orange-50",
        text: "text-stone-800 font-normal",
        iconColor: "text-stone-800",
      };
  }
};

const EmptyMessagesState = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div
      className="relative mb-6 overflow-hidden"
      style={{
        width: "135px",
        height: "136px",
        borderRadius: "101px",
      }}
    >
      <Image
        src="/private/home/msgAnim.gif"
        alt="No messages"
        fill
        className="object-cover"
      />
    </div>
    <h3 className="text-[#2A1D1D] text-center self-stretch font-inter text-base font-medium leading-normal mb-1">
      Chat with your Matches. Build Connections.
    </h3>
    <p className="text-[#7B6A64] text-center self-stretch font-inter text-[13px] font-normal leading-normal mt-18">
      Your Personal messages are end-to-end encrypted
    </p>
  </div>
);

const MessageList = ({ activeChatId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [matches, setMatches] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [received, setReceived] = useState([]);

  // Read the active tab from URL, default to 'matches'
  const activeTab = searchParams.get("tab") || "matches";

  const getAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

   
    return age;
  };

  const fetchAllTabs = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const [matchesRes, sentRes, receivedRes] = await Promise.all([
        api.get("/chat/accepted", "private"),
        api.get("/chat/sent", "private"),
        api.get("/chat/received", "private"),
      ]);

      setMatches(matchesRes.data ?? []);
      setSent(sentRes.data ?? []);
      setReceived(receivedRes.data ?? []);
    } catch (err) {
      console.error("Failed to fetch messages", err);
      toast.error("Failed to refresh messages");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleAcceptRequest = async (requestId) => {
    // Immediate UI removal
    setReceived((prev) => prev.filter((item) => item._id !== requestId));

    try {
      const response = await api.put(
        "/chat/respond",
        {
          requestId,
          action: "accepted",
        },
        "private",
      );
      if (response.success) {
        toast.success(response.message || "Request accepted successfully");
        fetchAllTabs(false); // Background refresh
      } else {
        toast.error(response.message || "Failed to accept request");
        fetchAllTabs(false); // Revert UI if needed by fetching again
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      fetchAllTabs(false); // Revert UI
    }
  };

  const handleRejectRequest = async (requestId) => {
    // Immediate UI removal
    setReceived((prev) => prev.filter((item) => item._id !== requestId));

    try {
      const response = await api.put(
        "/chat/respond",
        {
          requestId,
          action: "rejected",
        },
        "private",
      );
      if (response.success) {
        toast.success(response.message || "Request rejected successfully");
        fetchAllTabs(false); // Background refresh
      } else {
        toast.error(response.message || "Failed to reject request");
        fetchAllTabs(false); // Revert UI
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      fetchAllTabs(false); // Revert UI
    }
  };

  useEffect(() => {
    fetchAllTabs(true);
  }, [activeTab, fetchAllTabs]);

  const tabs = [
    { id: "matches", label: "Your Matches", count: matches.length },
    { id: "sent", label: "Sent", count: sent.length },
    { id: "received", label: "Received", count: received.length },
  ];

  // Logic: When tab is clicked, remove ID (go to /messages) and set the ?tab= param
  const handleTabClick = (tabId) => {
    router.push(`/messages?tab=${tabId}`);
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="w-full border-b border-gray-200 flex justify-between items-center px-4 md:px-0 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`h-16 cursor-pointer py-2.5 border-b-2 transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === tab.id
              ? "border-stone-800 text-stone-800 font-medium"
              : "border-transparent text-stone-500 hover:border-gray-300"
              }`}
          >
            <span className="text-[13px] sm:text-[15px] md:text-base">{tab.label}</span>
            {tab.count > 0 && (
              <span className="text-[10px] sm:text-xs md:text-sm font-normal opacity-70">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 md:px-0 overflow-y-auto pb-20">
        <h1 className="text-green-600 text-2xl font-semibold mb-1.5 hidden md:block">
          {activeTab === "matches"
            ? "Messages"
            : activeTab === "sent"
              ? "Send Interests"
              : "Received Interests"}
        </h1>

        {/* MATCHES TAB */}
        {activeTab === "matches" && (
          <div className="flex flex-col gap-4 mt-4">
            {!loading && matches.length === 0 ? (
              <EmptyMessagesState />
            ) : (
              matches?.map((user) => {
                const lastMsg = user.conversation?.lastMessage;
                const hasUnread = user.unread > 0;
                const isMyTurn = lastMsg && lastMsg.senderId === user.otherProfile?.userId;

                return (
                  <Link
                    href={`/messages/${user.conversation._id}`}
                    key={user.conversation._id}
                  >
                    <div
                      className={`p-5 rounded-[2rem] shadow-md  flex items-start gap-4 hover:shadow-lg transition-all cursor-pointer relative ${activeChatId === user.conversation._id
                        ? "bg-[rgba(0,0,0,0.15)]"
                        : "bg-white border-transparent border"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {(() => {
                          const image = user.otherProfile?.profilePhotos?.find((p) => p.isMain)?.url || user.otherProfile?.profilePhotos?.[0]?.url;
                          if (image) {
                            return (
                              <Image
                                src={image}
                                width={64}
                                height={64}
                                alt={user.otherProfile.fullName}
                                className="rounded-full object-cover w-16 h-16 border-2 border-white shadow-sm"
                              />
                            );
                          }
                          return (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                              {user.otherProfile.fullName?.[0]}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-12">
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-[#2A1D1D] text-lg truncate">
                            {user.otherProfile.fullName}
                          </h3>

                          {/* Subtext: Last Message or Profile Summary */}
                          {lastMsg ? (
                            <p className={`text-[15px] truncate leading-normal ${hasUnread ? "text-[#2A1D1D] font-semibold" : "text-[#7B6A64]"}`}>
                              {lastMsg.text}
                            </p>
                          ) : (
                            <div className="flex flex-col text-[#7B6A64] text-[13px] leading-relaxed mt-0.5">
                              <p className="truncate">
                                {user.otherProfile.height ? Math.floor(user.otherProfile.height / 30.48) + "'" + Math.round((user.otherProfile.height % 30.48) / 2.54) + '" • ' : ""}
                                {user.otherProfile.city || "N/A"} • {user.otherProfile.religion || ""} {user.otherProfile.community || ""}
                              </p>
                              <p className="truncate">
                                {user.otherProfile.highestEducation || ""} {user.otherProfile.degree && `(${user.otherProfile.degree})`} • {user.otherProfile.profession || ""} • {user.otherProfile.annualIncome || ""}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section: Time & Badges */}
                      <div className="absolute top-6 right-6 flex flex-col items-end gap-3 h-[calc(100%-3rem)]">
                        <span className="text-stone-400 text-xs font-medium whitespace-nowrap">
                          {timeAgo(lastMsg?.createdAt || user.conversation.updatedAt)}
                        </span>

                        <div className="mt-auto">
                          {hasUnread ? (
                            <div className="w-7 h-7 bg-[#468B60] rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                              {user.unread}
                            </div>
                          ) : isMyTurn ? (
                            <div className="px-3 py-1 rounded-full border border-[#468B60] text-[#468B60] text-[11px] font-bold bg-[#468B60]/5">
                              Reply
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* SENT TAB */}
        {activeTab === "sent" && (
          <div className="w-full flex flex-col gap-4 mt-4">
            {!loading && sent.length === 0 ? (
              <EmptyMessagesState />
            ) : (
              sent.map((user) => {
                const styles = getStatusStyles(user.status);
                return (
                  <div
                    key={user._id}
                    className="w-full p-5 bg-white rounded-[2rem] shadow-md border border-transparent flex items-center transition-all hover:shadow-lg"
                  >
                    <div className="flex-1 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-4">
                        {(() => {
                          const image = user.receiverId.profilePhotos?.find((p) => p.isMain)?.url || user.receiverId.profilePhotos?.[0]?.url;
                          if (image) {
                            return (
                              <Image
                                src={image}
                                width={64}
                                height={64}
                                alt={user.receiverId.fullName}
                                className="rounded-full object-cover w-16 h-16 border-2 border-white shadow-sm"
                              />
                            );
                          }
                          return (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-sm">
                              {user.receiverId.fullName?.[0]}
                            </div>
                          );
                        })()}
                        <div className="text-stone-900 text-lg font-bold truncate max-w-[180px]">
                          {user.receiverId.fullName},{" "}
                          {getAge(user.receiverId.dob)}
                        </div>
                      </div>
                      <div
                        className={`px-5 py-2 ${styles.bg} rounded-full flex justify-center items-center gap-2 shadow-sm`}
                      >
                        <div
                          className={`text-sm font-bold ${styles.text}`}
                        >
                          {user.status}
                        </div>
                        <Clock className={`w-4 h-4 ${styles.text} opacity-70`} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* RECEIVED TAB */}
        {activeTab === "received" && (
          <div className="w-full flex flex-col gap-4 mt-4">
            {!loading && received.length === 0 ? (
              <EmptyMessagesState />
            ) : (
              received.map((user) => (
                <div
                  key={user.id}
                  className="w-full p-5 bg-white rounded-[2rem] shadow-md border border-transparent flex items-center hover:shadow-lg transition-all"
                >
                  <div className="w-full flex justify-between items-center">
                    <div className="flex justify-start items-center gap-4">
                      {(() => {
                        const image = user.senderId.profilePhotos?.find((p) => p.isMain)?.url || user.senderId.profilePhotos?.[0]?.url;
                        if (image) {
                          return (
                            <Image
                              src={image}
                              width={64}
                              height={64}
                              alt={user.senderId.fullName}
                              className="rounded-full object-cover w-16 h-16 border-2 border-white shadow-sm"
                            />
                          );
                        }
                        return (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-sm">
                            {user.senderId.fullName?.[0]}
                          </div>
                        );
                      })()}
                      <div className="text-stone-900 text-lg font-bold truncate max-w-[200px]">
                        {user.senderId.fullName}, {getAge(user.senderId.dob)}
                      </div>
                    </div>
                    <div className="flex justify-start items-center gap-4">
                      <button
                        className="cursor-pointer w-12 h-12 bg-white rounded-full shadow-sm border border-red-900/20 flex justify-center items-center hover:bg-red-50 hover:border-red-900 transition-all active:scale-95 group"
                        onClick={() => handleRejectRequest(user._id)}
                      >
                        <X className="w-6 h-6 text-red-900/60 group-hover:text-red-900" strokeWidth={2.5} />
                      </button>
                      <button
                        className="cursor-pointer w-12 h-12 bg-[#468B60] rounded-full shadow-lg flex justify-center items-center hover:bg-[#3d7a54] transition-all active:scale-95"
                        onClick={() => handleAcceptRequest(user._id)}
                      >
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
