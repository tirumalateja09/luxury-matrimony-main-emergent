"use client";
import { useSearchParams, useRouter } from "next/navigation"; // Import hook
import MessageList from "@/app/component/Private/Message/MessageList";
import Image from "next/image";
import { Send } from "lucide-react";

// ... (keep tips and activityMetrics arrays same as before) ...
const tips = [
  "Add a personalized message with your interest",
  "Complete your profile to 100%",
  "Upload recent, clear photos",
  "Send interests to 85%+ compatibility matches",
];

const activityMetrics = [
  { label: "Interests sent this week", value: "3", color: "text-zinc-800" },
  { label: "Profile views this week", value: "127", color: "text-zinc-800" },
  { label: "Average response time", value: "2 hours", color: "text-green-800" },
];

export default function MessagesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "matches";

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 h-[calc(100vh-100px)]">

      {/* LEFT COLUMN: MessageList reads URL params internally now */}
      <div className="lg:col-span-7 h-full overflow-hidden">
        <MessageList activeChatId={null} />
      </div>

      {/* RIGHT COLUMN: Based on activeTab from URL */}
      <div className="hidden lg:col-span-5 lg:flex flex-col items-center h-full">

        {/* {activeTab === "matches" && (
          <div className="w-full flex flex-col items-center justify-center text-center p-8 bg-stone-50/50 rounded-3xl border border-stone-100 h-full">
            <div className="w-32 h-32 bg-white flex items-center justify-center rounded-full shadow-lg mb-6">
              <Image width={100} height={100} src="/private/message/message.gif" alt="Chat" />
            </div>
            <h2 className="text-stone-800 text-lg font-medium">Chat with your Matches</h2>
            <p className="text-stone-500 text-sm mt-2">Select a conversation to start messaging</p>
          </div>
        )} */}
        <div className="w-full md:w-80 flex flex-col gap-6 p-2 md:p-0">
          {/* ... (Activity Cards Content Same as previous) ... */}
          <div className="w-full bg-gradient-to-b from-[#4A8B5F] to-[#2D5F3F] rounded-2xl shadow-lg p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Send className="text-white w-6 h-6" />
              </div>
              <div className="flex text-start flex-col gap-1">
                <h3 className="text-white text-base font-semibold font-playfair">Send Interests</h3>
                <p className="text-white/90 font-inter text-xs font-normal leading-relaxed">
                  Keep track of Message Interests sent to your potential matches.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/matches')}
              className="cursor-pointer w-full py-2.5 bg-white rounded-3xl shadow-md border-[1.18px] border-stone-800 hover:bg-stone-50 transition-colors text-red-900 text-base font-medium">
              Send New Interest
            </button>
          </div>

          <div className="w-full p-4 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-2">
            <h3 className="text-zinc-800 text-base font-semibold font-playfair flex items-center gap-2">💡 Increase Response Rate</h3>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-800 text-sm flex-shrink-0">✓</span>
                  <span className="text-zinc-600 text-xs leading-tight">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="w-full p-4 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-zinc-800 text-start text-base font-semibold font-playfair">Your Activity</h3>
            <div className="flex flex-col gap-2">
              {activityMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center gap-4">
                  <span className="text-[#5F5F5F] font-inter text-xs">{metric.label}</span>
                  <span className={`text-base font-semibold whitespace-nowrap ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}