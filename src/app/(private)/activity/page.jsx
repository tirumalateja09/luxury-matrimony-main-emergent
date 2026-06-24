"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ProfileCard from "@/app/component/Private/Home/ProfileCard";
import { ChevronRight, Heart, Send } from "lucide-react";
import { api } from "@/lib/apiClient";
import MobileHeader from "@/app/component/MobileHeader";

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

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "accepted";
  const [interestData, setInterestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const tabs = [
    { id: "accepted", label: "Accepted" },
    { id: "sent", label: "Sent" },
    { id: "received", label: "Received" },
  ];

  const [tabCounts, setTabCounts] = useState({
    accepted: 0,
    sent: 0,
    received: 0,
  });

  const handleMyData = async () => {
    const res = await api.get(`/profile/summary`, "private");
    if (res.success) {
      setSummary(res.data);
    }
  };

  const updateTabParam = useCallback(
    (tabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const fetchByTab = useCallback(async () => {
    setInterestData([]);
    setLoading(true);
    try {
      const endpoint =
        activeTab === "shortlisted"
          ? "/shortlist/my-list"
          : `/interest/my-interests?tab=${activeTab}`;

      const res = await api.get(endpoint, "private");


      if (res.success) {
        // Normalizing data here so the JSX doesn't need complex ternaries
        const normalizedData = res.data
          .map((item) => {
            // Shortlisted already returns profile directly
            if (activeTab === "shortlisted") {
              return item;
            }

            // Received needs interestId merged into profile
            if (activeTab === "received") {
              return {
                ...item.profile,
                interestId: item.interestId,
                status: item.status,
              };
            }

            // Accepted & Sent
            return item.profile;
          })
          .filter(Boolean);
      
        setInterestData(normalizedData);
        if (activeTab !== "shortlisted") {
          setTabCounts((prev) => ({
            ...prev,
            [activeTab]: normalizedData.length,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch interests", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialCounts = async () => {
      try {
        const [acceptedRes, sentRes, receivedRes] = await Promise.all([
          api.get("/interest/my-interests?tab=accepted", "private"),
          api.get("/interest/my-interests?tab=sent", "private"),
          api.get("/interest/my-interests?tab=received", "private"),
        ]);
        if (isMounted) {
          const normalizedData1 = sentRes.data
            .map((item) => {
              //  Sent
              return item.profile;
            })
            .filter(Boolean);
          setTabCounts({
            accepted: acceptedRes.data?.length || 0,

            sent: normalizedData1.length || sentRes.data?.length || 0,
            received: receivedRes.data?.length || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch initial counts", err);
      }
    };
    fetchInitialCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      updateTabParam(activeTab);
    }
  }, [activeTab, searchParams, updateTabParam]);

  useEffect(() => {
    handleMyData();
    fetchByTab();
  }, [activeTab, fetchByTab]);
  const isPremium =
    summary?.membershipType === "Gold" || summary?.membershipType === "Premium";
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-inter md:px-0 mb-40 sm:mb-0">
      <MobileHeader isRead={true} />

      {/* 1. Navigation Bar - Full Width below Header */}
      <div className="w-full border-b border-gray-200 flex justify-between items-center px-4 md:px-0 mb-4">
        {/* Left Side: Standard Tabs */}
        <div
          className={`w-full lg:w-[58.33%] border-transparent ${activeTab === "shortlisted" ? "hidden sm:flex" : "flex"} justify-between items-center pr-0 lg:pr-8`}
        >
          {tabs.map((tab) => {
        
            const displayCount =
              activeTab === tab.id ? interestData.length : tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => updateTabParam(tab.id)}
                className={`h-16 cursor-pointer py-2.5 border-b-2 transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-stone-800 text-stone-800 font-medium"
                    : "border-transparent text-stone-500 hover:border-gray-300"
                }`}
              >
                <span className="text-[13px] sm:text-[15px] md:text-base">
                  {tab.label}
                </span>
                {displayCount > 0 && (
                  <span className="text-[10px] sm:text-xs md:text-sm font-normal opacity-70">
                    ({displayCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Desktop-Only Shortlisted Filter Button */}
        <button
          onClick={() => updateTabParam("shortlisted")}
          className={`hidden md:flex flex-shrink-0 cursor-pointer w-auto h-16 items-center gap-3 group transition-colors ${
            activeTab === "shortlisted"
              ? "opacity-100 rounded-xl px-2"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex justify-center items-center shadow-sm ${
                activeTab === "shortlisted" ? "bg-[#429466]" : "bg-green-600"
              }`}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-medium whitespace-nowrap ${activeTab === "shortlisted" ? "text-[#2A1D1D]" : "text-stone-500"}`}
              >
                Shortlisted Matches
              </span>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-green-600 transition-transform ${activeTab === "shortlisted" ? "rotate-90" : "group-hover:translate-x-1"}`}
          />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6 md:mt-10">
        {/* Left Column: Interests Content */}
        <div className="flex-1 flex flex-col gap-6 md:gap-10">
          {/* 1. Mobile-Only Shortlisted Match Card */}
          <div className="md:hidden px-4 sm:px-0">
            <button
              onClick={() => updateTabParam("shortlisted")}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#429466] rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-stone-800 font-semibold md:text-lg">
                    Shortlisted Matches
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>

            <h2
              className={`text-2xl font-serif text-green-800 mt-8 mb-2 ${activeTab === "shortlisted" ? "hidden sm:block" : "block"}`}
            >
              Interests
            </h2>
          </div>

          {/* 2. Content Area */}
          <div className="w-full mx-auto">
            {!loading && interestData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div
                  className="mb-8"
                  style={{
                    width: "125px",
                    height: "125px",
                    borderRadius: "285px",
                    background:
                      "url(/private/home/bellAnim.gif) lightgray -70.38px -36.13px / 212.92% 164.8% no-repeat",
                  }}
                />
                <h3 className="text-[#2A1D1D] text-center self-stretch font-inter text-base font-medium leading-normal mb-1">
                  No interests yet
                </h3>
                <p className="text-[#7B6A64] text-center self-stretch font-inter text-base font-normal leading-normal">
                  When you send or receive interests, they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {interestData.map((user, ind) => (
                  <div
                    key={ind}
                    className="min-w-[85%] sm:min-w-[70%] md:min-w-0"
                  >
                    <ProfileCard
                      summary={summary}
                      user={user}
                      status={activeTab}
                      onPhotoClick={() =>
                        router.push(`/user/${user.profile?.userId || user.userId}`)
                      }
                      fetchData={fetchByTab}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Sidebar (Fixed Width on Desktop) */}
        <div className="w-full lg:w-80 hidden lg:flex flex-col gap-6">
          <div className="w-full bg-gradient-to-b from-[#4A8B5F] to-[#2D5F3F] rounded-2xl shadow-lg p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Send className="text-white w-6 h-6" />
              </div>
              <div className="flex text-start flex-col gap-1">
                <h3 className="text-white text-base font-semibold font-playfair">
                  Send Interests
                </h3>
                <p className="text-white/90 font-inter text-xs font-normal leading-relaxed">
                  Keep track of Message Interests sent to your potential
                  matches.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/matches")}
              className="cursor-pointer w-full py-2.5 bg-white rounded-3xl shadow-md border-[1.18px] border-stone-800 hover:bg-stone-50 transition-colors text-red-900 text-base font-medium"
            >
              Send New Interest
            </button>
          </div>

          <div className="w-full p-4 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-2">
            <h3 className="text-zinc-800 text-base font-semibold font-playfair flex items-center gap-2">
              💡 Increase Response Rate
            </h3>
            <ul className="space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-800 text-sm flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-zinc-600 text-xs leading-tight">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="w-full p-4 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-zinc-800 text-start text-base font-semibold font-playfair">
              Your Activity
            </h3>
            <div className="flex flex-col gap-2">
              {activityMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center gap-4"
                >
                  <span className="text-[#5F5F5F] font-inter text-xs">
                    {metric.label}
                  </span>
                  <span
                    className={`text-base font-semibold whitespace-nowrap ${metric.color}`}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Page;
