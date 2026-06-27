import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const profileId = params?.profileId;
  const authorization = request.headers.get("authorization");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!profileId) {
    return NextResponse.json(
      {
        success: false,
        message: "Profile ID is required.",
      },
      { status: 400 },
    );
  }

  if (!baseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "API base URL is not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `${baseUrl}/admin/user-details/profile/${profileId}`,
      {
        method: "GET",
        headers: authorization ? { Authorization: authorization } : {},
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({
      success: false,
      message: "Invalid response from upstream server.",
    }));

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user details.",
      },
      { status: 500 },
    );
  }
}
