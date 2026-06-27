"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";

const GUNA_KEYS = [
  { key: "varna", label: "Varna" },
  { key: "vasya", label: "Vasya" },
  { key: "tara", label: "Tara" },
  { key: "yoni", label: "Yoni" },
  { key: "graha_maitri", label: "Graha Maitri" },
  { key: "gana", label: "Gana" },
  { key: "bhakoot", label: "Bhakoot" },
  { key: "nadi", label: "Nadi" },
];

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveSource = (source) =>
  source?.profile || source?.data?.profile || source?.data || source || {};

const getField = (source, field) => {
  const resolved = resolveSource(source);

  return resolved?.[field] ?? source?.[field] ?? source?.data?.[field] ?? "";
};

const formatDate = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
};

const formatTime = (value) => {
  if (!value) return "";

  const raw = String(value).trim().toUpperCase();
  const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = amPmMatch[2];
    const seconds = amPmMatch[3] || "00";
    const meridiem = amPmMatch[4];

    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours !== 12) hours += 12;

    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  }

  const simpleMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (simpleMatch) {
    const hours = String(Number(simpleMatch[1])).padStart(2, "0");
    return `${hours}:${simpleMatch[2]}:${simpleMatch[3] || "00"}`;
  }

  return "";
};

const normalizeGender = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "male") return "male";
  if (normalized === "female") return "female";

  return "";
};

const buildParticipant = (source) => {
  const dob = formatDate(getField(source, "dob"));
  const birthTime = formatTime(getField(source, "birthTime"));
  const lat = Number(getField(source, "lat"));
  const long = Number(getField(source, "long"));
  const gender = normalizeGender(getField(source, "gender"));
  const name = getField(source, "fullName") || "Profile";

  const hasValidCoordinates = Number.isFinite(lat) && Number.isFinite(long);

  return {
    name,
    dob,
    birthTime,
    lat,
    long,
    gender,
    isComplete: Boolean(dob && birthTime && hasValidCoordinates),
  };
};

const getMatchScore = (data) =>
  data?.guna_milan?.total_points ??
  data?.total_points ??
  data?.total_score ??
  data?.score ??
  data?.matching_points ??
  data?.points ??
  null;

const getMaximumScore = (data) =>
  data?.guna_milan?.maximum_points ??
  data?.maximum_points ??
  null;

const getAvailabilityMessage = (currentUser, viewedUser) => {
  if (!currentUser.isComplete || !viewedUser.isComplete) {
    return "Horoscope not available";
  }

  return "";
};

const resolveParticipants = (currentUser, viewedUser) => {
  if (viewedUser.gender === "female") {
    return { girl: viewedUser, boy: currentUser };
  }

  if (viewedUser.gender === "male") {
    return { girl: currentUser, boy: viewedUser };
  }

  if (currentUser.gender === "female") {
    return { girl: currentUser, boy: viewedUser };
  }

  if (currentUser.gender === "male") {
    return { girl: viewedUser, boy: currentUser };
  }

  return { girl: viewedUser, boy: currentUser };
};

export default function KundliMatchModal({
  isOpen,
  onClose,
  summary,
  viewedProfile,
}) {
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState("");

  const currentUser = useMemo(() => buildParticipant(summary), [summary]);
  const viewedUser = useMemo(
    () => buildParticipant(viewedProfile),
    [viewedProfile],
  );
  const unavailableMessage = useMemo(
    () => getAvailabilityMessage(currentUser, viewedUser),
    [currentUser, viewedUser],
  );
  const { boy: boyParticipant, girl: girlParticipant } = useMemo(
    () => resolveParticipants(currentUser, viewedUser),
    [currentUser, viewedUser],
  );

  useEffect(() => {
    if (!isOpen) return;

    setMatchResult(null);
    setError("");

    if (unavailableMessage) {
      return;
    }

    const fetchMatch = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/kundli-match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            boy_dob: boyParticipant.dob,
            boy_tob: boyParticipant.birthTime,
            boy_lat: boyParticipant.lat,
            boy_lon: boyParticipant.long,
            girl_dob: girlParticipant.dob,
            girl_tob: girlParticipant.birthTime,
            girl_lat: girlParticipant.lat,
            girl_lon: girlParticipant.long,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch horoscope match");
        }

        setMatchResult(data);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to fetch horoscope match");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [boyParticipant, girlParticipant, isOpen, unavailableMessage]);

  if (!isOpen) return null;

  const resultData = matchResult?.data || {};
  const score = getMatchScore(resultData);
  const maximumScore = getMaximumScore(resultData);
  const girlInfo = resultData?.girl_info || {};
  const boyInfo = resultData?.boy_info || {};
  const message = resultData?.message || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
          <div>
            <h3 className="text-2xl font-playfair font-semibold text-[#2A1D1D]">
              Horoscope Match
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Compatibility details for both profiles
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:bg-stone-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
          {unavailableMessage ? (
            <UnavailableState message={unavailableMessage} />
          ) : loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 className="animate-spin" size={28} />
              <p>Fetching horoscope match...</p>
            </div>
          ) : error ? (
            <UnavailableState message={error} />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryCard
                  label="Score"
                  value={
                    score !== null
                      ? `${score}${maximumScore !== null ? ` / ${maximumScore}` : ""}`
                      : "Not available"
                  }
                />
                <SummaryCard
                  label="Matched Pair"
                  value={`${currentUser.name} & ${viewedUser.name}`}
                />
              </div>

              <div className="rounded-[24px] border border-stone-100 bg-gradient-to-r from-[#FFF7E2] to-[#FFFDF6] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                  Match Result
                </p>
                <p className="mt-2 text-lg font-semibold text-[#2A1D1D]">
                  {toTitleCase(message?.type || "Available")}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {message?.description || "Horoscope match details are available."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <PersonCard
                  title="Bride"
                  info={girlInfo}
                  fallbackName={girlParticipant.name}
                />
                <PersonCard
                  title="Groom"
                  info={boyInfo}
                  fallbackName={boyParticipant.name}
                />
              </div>

              <div className="rounded-[24px] border border-stone-100 bg-stone-50/80 p-5">
                <div className="mb-4 flex items-center gap-2 text-[#2A1D1D]">
                  <Sparkles size={18} className="text-[#E3B450]" />
                  <h4 className="font-semibold">Koot Details</h4>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {GUNA_KEYS.map(({ key, label }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-stone-100 bg-white px-4 py-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                        {label}
                      </p>
                      <p className="mt-1 text-sm text-stone-700">
                        Bride: {girlInfo?.koot?.[key] || "-"}
                      </p>
                      <p className="text-sm text-stone-700">
                        Groom: {boyInfo?.koot?.[key] || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailBlock
                  title="Bride Details"
                  items={[
                    ["Nakshatra", girlInfo?.nakshatra?.name],
                    ["Nakshatra Pada", girlInfo?.nakshatra?.pada],
                    ["Nakshatra Lord", girlInfo?.nakshatra?.lord?.name || girlInfo?.nakshatra?.lord?.vedic_name],
                    ["Rasi", girlInfo?.rasi?.name],
                    ["Rasi Lord", girlInfo?.rasi?.lord?.name || girlInfo?.rasi?.lord?.vedic_name],
                  ]}
                />
                <DetailBlock
                  title="Groom Details"
                  items={[
                    ["Nakshatra", boyInfo?.nakshatra?.name],
                    ["Nakshatra Pada", boyInfo?.nakshatra?.pada],
                    ["Nakshatra Lord", boyInfo?.nakshatra?.lord?.name || boyInfo?.nakshatra?.lord?.vedic_name],
                    ["Rasi", boyInfo?.rasi?.name],
                    ["Rasi Lord", boyInfo?.rasi?.lord?.name || boyInfo?.rasi?.lord?.vedic_name],
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-stone-100 bg-stone-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[#2A1D1D]">
        {value || "-"}
      </p>
    </div>
  );
}

function PersonCard({ title, info, fallbackName }) {
  const nakshatra = info?.nakshatra?.name || "-";
  const nakshatraLord =
    info?.nakshatra?.lord?.name || info?.nakshatra?.lord?.vedic_name || "-";
  const rasi = info?.rasi?.name || "-";
  const rasiLord =
    info?.rasi?.lord?.name || info?.rasi?.lord?.vedic_name || "-";
  const category = info?.category || info?.type || "-";

  return (
    <div className="rounded-[24px] border border-stone-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold text-[#2A1D1D]">
        {info?.name || fallbackName || title}
      </p>
      <p className="mt-2 text-sm text-stone-600">Nakshatra: {nakshatra}</p>
      <p className="text-sm text-stone-600">Nakshatra Lord: {nakshatraLord}</p>
      <p className="text-sm text-stone-600">
        Pada: {info?.nakshatra?.pada || "-"}
      </p>
      <p className="text-sm text-stone-600">Rasi: {rasi}</p>
      <p className="text-sm text-stone-600">Rasi Lord: {rasiLord}</p>
      <p className="text-sm text-stone-600">Category: {category}</p>
    </div>
  );
}

function UnavailableState({ message }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-stone-200 bg-stone-50 px-6 text-center">
      <Sparkles size={24} className="text-[#E3B450]" />
      <p className="text-lg font-semibold text-[#2A1D1D]">{message}</p>
    </div>
  );
}

function DetailBlock({ title, items }) {
  return (
    <div className="rounded-[24px] border border-stone-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-stone-50 pb-2 last:border-b-0 last:pb-0">
            <span className="text-sm text-stone-500">{label}</span>
            <span className="text-right text-sm font-medium text-stone-800">
              {value || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
