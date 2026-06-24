"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import MessageList from "@/app/component/Private/Message/MessageList";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  FileText,
  Crown,
  Send,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id; // Conversation ID

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [manualNumber, setManualNumber] = useState("");

  const scrollRef = useRef(null);

  // 1. Find the active conversation details from the matches list for the Header
  const activeMatch = matches.find((m) => m.conversation?._id === id);

  // 2. Construct the Chat Partner user object for UI
  const user = activeMatch
    ? {
        id: activeMatch.otherProfile?.userId,
        name: activeMatch.otherProfile?.fullName || "Chat Partner",
        image:
          activeMatch.otherProfile?.profilePhotos?.find((p) => p.isMain)?.url ||
          activeMatch.otherProfile?.profilePhotos?.[0]?.url,
        gradient: "from-blue-400 to-indigo-500",
      }
    : null;

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [messagesRes, matchesRes] = await Promise.all([
          api.get(`/messages/${id}`, "private"),
          api.get("/chat/accepted", "private"),
        ]);

        const msgList = messagesRes.data?.data || messagesRes.data || [];
        const matchesList = matchesRes.data?.data || matchesRes.data || [];

        if (cancelled) return;

        setMessages(msgList);
        setMatches(matchesList);

        const currentConversation = matchesList.find(
          (m) => m.conversation?._id === id,
        );

        if (currentConversation) {
          const otherId = currentConversation.otherProfile?.userId;
          const participants =
            currentConversation.conversation?.participants || [];

          const myId = participants.find((pId) => pId !== otherId);
          if (myId) setCurrentUserId(myId);

          // ✅ CHECK CONTACT STATUS FOR THIS CHAT USER
          if (otherId) {
            const contactRes = await api.get(
              `/contact/check-status/${otherId}`,
              "private",
            );

            const contactData = contactRes?.data ?? contactRes;

            if (
              contactData?.status === "pending" &&
              contactData?.amITheReceiver
            ) {
              setIncomingRequest({
                _id: contactData.requestId,
              });
              setShowContactModal(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const input = e.target.elements.messageInput;
    const text = input.value.trim();

    if (!text || !currentUserId) return;

    // 1. Optimistic UI Update (Show message immediately)
    const tempId = Date.now();
    const optimisticMessage = {
      _id: tempId,
      text: text,
      senderId: { _id: currentUserId }, // Use the dynamically found ID
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    input.value = ""; // Clear input

    try {
      // 2. Call API (POST /messages/send)
      const res = await api.post(
        "/messages/send",
        { conversationId: id, text },
        "private",
      );

      // Optional: If API returns the real message object, you could replace the optimistic one here
      if (res.success) {
        setRequestSent(true);
      }
    } catch (err) {
      console.error("Failed to send message", err);
      // Optional: Add logic to show "Failed to send" error in UI
    }
  };

  const handleSendContactRequest = async () => {
    if (!user?.id || sendingRequest) return;

    try {
      setSendingRequest(true);

      const res = await api.post(
        "/contact/request",
        { receiverId: user.id },
        "private",
      );

      if (res.data?.success) {
        setRequestSent(true);
      } else {
        toast.error(res.data?.message || "Failed to send request");
      }
    } catch (err) {
      const message = err?.message || "Something went wrong";
      toast(message, {
        icon: "⚠️",
        style: {
          border: "1px solid #facc15",
          padding: "8px",
          color: "#92400e",
          background: "#fef9c3",
        },
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRespondContactRequest = async () => {
    if (!incomingRequest?._id) return;

    try {
      const res = await api.put(
        `/contact/respond/${incomingRequest._id}`,
        {
          action: "accepted",
          manualNumber,
        },
        "private",
      );

      const success = res?.success ?? res?.data?.success;

      if (success) {
        setShowContactModal(false);
        setIncomingRequest(null);
        toast.success("Contact shared successfully!");
      } else {
        toast.error(res?.message || res?.data?.message || "Failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // Loading State
  if (loading && !user) {
    return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-[calc(100vh-100px)]">
        <div className="hidden lg:block lg:col-span-7 h-full overflow-hidden">
          <MessageList activeChatId={id} />
        </div>
        <div className="col-span-1 lg:col-span-5 flex flex-col h-full bg-white lg:rounded-3xl border-stone-200 items-center justify-center text-stone-400">
          <Loader2 className="animate-spin mb-2" /> Loading conversation...
        </div>
      </div>
    );
  }

  // Error/Empty State
  if (!user && !loading) {
    return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-[calc(100vh-100px)]">
        <div className="hidden lg:block lg:col-span-7 h-full overflow-hidden">
          <MessageList activeChatId={id} />
        </div>
        <div className="col-span-1 lg:col-span-5 flex flex-col h-full bg-white lg:rounded-3xl border-stone-200 items-center justify-center text-stone-500">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="xl:px-16 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-[calc(100vh-100px)] lg:h-auto">
      {/* LEFT COLUMN */}
      <div className="hidden lg:block lg:col-span-7 h-full overflow-hidden">
        <MessageList activeChatId={id} />
      </div>

      {/* RIGHT COLUMN */}
      <div className="col-span-1 lg:col-span-5 flex flex-col h-full md:h-[550px] bg-white lg:rounded-3xl lg:border border-stone-200 overflow-hidden relative font-sans">
        {/* --- HEADER --- */}

        <div className="bg-white p-3 px-4 border-b border-stone-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/messages?tab=matches"
              className="lg:hidden p-1 -ml-1 text-stone-600"
            >
              <ArrowLeft size={24} />
            </Link>

            <div className="relative">
              {user.image ? (
                <Image
                  src={user.image}
                  width={40}
                  height={40}
                  alt={user.name}
                  className="rounded-full w-10 h-10 object-cover"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.gradient} flex items-center justify-center text-white font-bold`}
                >
                  {user.name?.[0]}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div>
              <h3 className="text-stone-900 font-serif font-bold text-lg leading-tight">
                {user.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={14} className="text-[#BCA985]" />
                <span className="text-stone-500 text-xs font-medium">
                  Verified & Premium
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSendContactRequest}
              disabled={sendingRequest || requestSent}
              className={`w-10 h-10 cursor-pointer rounded-full border flex items-center justify-center transition-colors
    ${
      requestSent
        ? "border-green-600 text-green-600 bg-green-50"
        : "border-[#8C3E3E] text-[#8C3E3E] hover:bg-red-50"
    }
    ${sendingRequest ? "opacity-60 cursor-not-allowed" : ""}
  `}
            >
              {sendingRequest ? (
                <Loader2 size={18} className="animate-spin" />
              ) : requestSent ? (
                <CheckCircle2 size={18} />
              ) : (
                <Phone size={18} />
              )}
            </button>

            <button className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-50 relative transition-colors">
              <FileText size={18} />
              <div className="absolute -top-1 -right-1 bg-[#F4C430] rounded-full p-[3px] border border-white flex items-center justify-center">
                <Crown size={8} className="text-white fill-white" />
              </div>
            </button>
          </div>
        </div>

        {/* --- CHAT BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col bg-stone-50">
          {showContactModal && incomingRequest && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
              <div className="bg-white rounded-2xl p-6 shadow-xl w-[90%] max-w-sm">
                <h2 className="text-lg font-semibold mb-3">
                  Share Your Contact Number
                </h2>

                <p className="text-sm text-stone-500 mb-4">
                  {incomingRequest.senderProfile?.fullName} requested your
                  contact details.
                </p>

                <input
                  type="text"
                  placeholder="Enter mobile number"
                  value={manualNumber}
                  onChange={(e) => setManualNumber(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-green-600 outline-none"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleRespondContactRequest}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white"
                  >
                    Accept & Share
                  </button>
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, index) => {
            // Check if senderId matches currentUserId (extracted dynamically)
            const isMe =
              currentUserId &&
              (msg.senderId._id === currentUserId ||
                msg.senderId === currentUserId);

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col gap-1 max-w-[85%] ${
                  isMe ? "self-end items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    isMe
                      ? "bg-[#468B60] text-white rounded-tr-none"
                      : "bg-white text-stone-800 rounded-tl-none border border-stone-100"
                  }`}
                >
                  {msg.text}
                </div>
                <span
                  className={`text-stone-400 text-[10px] font-medium ${
                    isMe ? "mr-1" : "ml-1"
                  }`}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* --- FOOTER --- */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-stone-100 flex items-center gap-2 sticky bottom-0"
        >
          <div className="flex-1 relative">
            <input
              name="messageInput"
              type="text"
              autoComplete="off"
              placeholder="Type your message..."
              className="w-full bg-stone-50 border border-stone-100 rounded-full pl-5 pr-12 py-3 text-sm focus:ring-1 focus:ring-green-600 outline-none text-stone-700 placeholder-stone-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#468B60] hover:bg-[#3a7550] text-white rounded-full transition-colors"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
