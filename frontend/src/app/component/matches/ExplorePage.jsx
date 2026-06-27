"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import ProfileCard from "@/app/component/Private/Home/ProfileCard";
import MobileHeader from "@/app/component/MobileHeader";
import { Filter, Search, Loader2 } from "lucide-react";
import { useFilter } from "@/context/FilterContext";

const ExplorePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data States
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [summary, setSummary] = useState(null);

  // URL Params
  const currentFilter = searchParams.get("filterType") || "";
  const searchName = searchParams.get("fullName") || "";
  const minAge = searchParams.get("minAge") || "";
  const maxAge = searchParams.get("maxAge") || "";
  const minHeight = searchParams.get("minHeight") || "";
  const maxHeight = searchParams.get("maxHeight") || "";
  const religion = searchParams.get("religion") || "";
  const maritalStatus = searchParams.get("maritalStatus") || "";
  const community = searchParams.get("community") || "";
  const motherTongue = searchParams.get("motherTongue") || "";
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";
  const annualIncome = searchParams.get("annualIncome") || "";
  const highestEducation = searchParams.get("highestEducation") || "";
  const profession = searchParams.get("profession") || "";
  const diet = searchParams.get("diet") || "";
  const manglik = searchParams.get("manglik") || "";
  const context = useFilter();
  const setIsFilterOpen = context?.setIsFilterOpen || (() => {});

  // 1. Fetch Profiles Function
  const fetchProfiles = useCallback(
    async (isNewSearch = false) => {
      if (loading) return;

      setLoading(true);
      const currentPage = isNewSearch ? 1 : page;

      try {
        const response = await api.post(
          "/search/advanced",
          {
            filterType: currentFilter,
            fullName: searchName, // Search field pass in body
            minAge,
            maxAge,
            minHeight,
            maxHeight,
            religion,
            maritalStatus,
            community,
            motherTongue,
            state,
            city,
            annualIncome,
            highestEducation,
            profession,
            diet,
            manglik,
            page: currentPage,
            limit: 10,
          },
          "private",
        );

        if (response.success) {
          const newProfiles = response.data || [];

          if (isNewSearch) {
            setProfiles(newProfiles);
          } else {
            setProfiles((prev) => [...prev, ...newProfiles]);
          }

          // Check if we have more data to load
          setHasMore(newProfiles.length === 10);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      currentFilter,
      searchName,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      religion,
      maritalStatus,
      community,
      motherTongue,
      state,
      city,
      annualIncome,
      highestEducation,
      profession,
      diet,
      manglik,
      page,
    ],
  );

  // 2. Initial Fetch & Filter/Search Change
  useEffect(() => {
    setPage(1);
    fetchProfiles(true);
  }, [
    currentFilter,
    searchName,
    minAge,
    maxAge,
    minHeight,
    maxHeight,
    religion,
    maritalStatus,
    community,
    motherTongue,
    state,
    city,
    annualIncome,
    highestEducation,
    profession,
    diet,
    manglik,
  ]);

  // 3. Infinite Scroll Logic (Intersection Observer)
  const observer = useRef();
  const lastProfileRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  // Trigger page load when page number increases
  useEffect(() => {
    if (page > 1) {
      fetchProfiles(false);
    }
  }, [page]);

  useEffect(() => {
    handleMyData();
  }, []);
  const handleMyData = async () => {
    const res = await api.get(`/profile/summary`, "private");
    if (res.success) {
      setSummary(res.data);
    }
  };

  // Handle Input Changes (URL Sync)
  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:gap-8 font-inter">
      <MobileHeader
        defaultValue={searchName}
        onKeyDown={(e) =>
          e.key === "Enter" && updateParams("fullName", e.target.value)
        }
        updateParams={updateParams}
      />

      <div className="flex flex-col gap-8 px-4 lg:px-0">
        <div className="flex items-center gap-4 overflow-hidden flex-row-reverse sm:flex-row">
          {/* Search Input - Syncs with URL */}
          <div className="hidden lg:block relative max-w-lg flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700"
              size={20}
            />
            <input
              type="text"
              defaultValue={searchName}
              onKeyDown={(e) =>
                e.key === "Enter" && updateParams("fullName", e.target.value)
              }
              placeholder="Search your match"
              className="w-full text-gray-800 pl-12 pr-4 py-3 border border-[#E3B450] rounded-full bg-white outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar lg:max-w-[55%]">
            {[
              { label: "Top Matches", value: "topmatch" },
              { label: "Verified", value: "verified" },
              { label: "Just Joined", value: "new" },
              { label: "Featured", value: "featured" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParams("filterType", opt.value)}
                className={`cursor-pointer whitespace-nowrap px-5 py-3 rounded-full border text-sm transition hover:bg-[#F3DED3] ${
                  currentFilter === opt.value
                    ? "bg-[#fefcf5] text-stone-800 border-stone-800 border-[2px]"
                    : "bg-white text-stone-800 border-stone-400 border-[2px]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* <button
            onClick={() => {
              if (summary?.subscription === "Free") {
                router.push("/profile/membership");
              } else {
                setIsFilterOpen(true);
              }
            }}
            title={summary?.subscription === "Free" ? "Upgrade to view filters" : "Filters"}
            className="h-11 w-11 cursor-pointer flex items-center justify-center rounded-full border-stone-400 border-[2px] bg-white shrink-0"
          >
            <Filter size={18} className="text-[#E3B450]" />
          </button> */}
          <button
            onClick={() => {
              if (summary?.subscription === "Free") {
                router.push("/profile/membership");
              } else {
                setIsFilterOpen(true);
              }
            }}
            className="relative flex items-center gap-2 h-11 px-4 cursor-pointer rounded-full border-stone-400 border-[2px] bg-white shrink-0"
          >
            <Filter size={18} className="text-[#E3B450]" />

            {summary?.subscription === "Free" ? (
              <span className="text-[12px] font-medium text-[#E3B450] whitespace-nowrap">
                Upgrade to View
              </span>
            ) : (
              ""
            )}
          </button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profiles.map((user, index) => {
            if (profiles.length === index + 1) {
              return (
                <div ref={lastProfileRef} key={user._id}>
                  <ProfileCard
                    summary={summary}
                    user={user}
                    onPhotoClick={() => router.push(`/user/${user.userId}`)}
                  />
                </div>
              );
            } else {
              return (
                <ProfileCard
                  key={user._id}
                  summary={summary}
                  user={user}
                  onPhotoClick={() => router.push(`/user/${user.userId}`)}
                />
              );
            }
          })}
        </div>

        {/* Bottom Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-amber-600" size={32} />
          </div>
        )}

        {!hasMore && profiles.length > 0 && (
          <p className="text-center text-stone-400 py-8">
            No more profiles to show.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
