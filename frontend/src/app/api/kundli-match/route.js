import { NextResponse } from "next/server";
import { getProkeralaToken } from "@/lib/prokerala";

const normalizeTime = (value) => {
  const raw = String(value || "").trim().toUpperCase();
  const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/);

  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = amPmMatch[2];
    const seconds = amPmMatch[3] || "00";

    if (amPmMatch[4] === "AM" && hours === 12) hours = 0;
    if (amPmMatch[4] === "PM" && hours !== 12) hours += 12;

    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  }

  const simpleMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (simpleMatch) {
    return `${String(Number(simpleMatch[1])).padStart(2, "0")}:${simpleMatch[2]}:${simpleMatch[3] || "00"}`;
  }

  return "";
};

const buildIsoDateTime = (date, time) => {
  const normalizedTime = normalizeTime(time);
  if (!date || !normalizedTime) return "";

  return `${date}T${normalizedTime}+05:30`;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      boy_dob,
      boy_tob,
      boy_lat,
      boy_lon,
      girl_dob,
      girl_tob,
      girl_lat,
      girl_lon,
    } = body || {};

    const boyDateTime = buildIsoDateTime(boy_dob, boy_tob);
    const girlDateTime = buildIsoDateTime(girl_dob, girl_tob);

    if (
      !boyDateTime ||
      !girlDateTime ||
      !Number.isFinite(Number(boy_lat)) ||
      !Number.isFinite(Number(boy_lon)) ||
      !Number.isFinite(Number(girl_lat)) ||
      !Number.isFinite(Number(girl_lon))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing or invalid horoscope details.",
        },
        { status: 400 },
      );
    }

    const token = await getProkeralaToken();
    const query = new URLSearchParams({
      ayanamsa: "1",
      girl_coordinates: `${girl_lat},${girl_lon}`,
      girl_dob: girlDateTime,
      boy_coordinates: `${boy_lat},${boy_lon}`,
      boy_dob: boyDateTime,
      la: "en",
    });

    const upstreamResponse = await fetch(
      `https://api.prokerala.com/v2/astrology/kundli-matching?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await upstreamResponse.json().catch(() => ({
      success: false,
      message: "Invalid response from horoscope service.",
    }));

    return NextResponse.json(data, { status: upstreamResponse.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch horoscope match.",
      },
      { status: 500 },
    );
  }
}
