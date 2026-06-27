"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AdminContactQueriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPageParam = Number(searchParams.get("page") || "1");
  const initialPage =
    Number.isFinite(initialPageParam) && initialPageParam > 0
      ? initialPageParam
      : 1;

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const PAGE_SIZE = 10;

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      router.push("/adminlogin");
      return;
    }
    setToken(savedToken);
  }, [router]);

  const fetchQueries = useCallback(
    async (authToken, nextPage = 1) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        params.set("limit", String(PAGE_SIZE));

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/contact-us?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("adminToken");
            router.push("/adminlogin");
            return;
          }
          throw new Error(data?.message || "Failed to fetch contact queries");
        }

        const rows = data?.data || data?.queries || data?.results || [];
        setQueries(Array.isArray(rows) ? rows : []);
        setPage(data?.currentPage || data?.page || nextPage);
        setTotalPages(data?.totalPages || 1);
      } catch (err) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!token || page < 1) return;
    fetchQueries(token, page);
  }, [token, page, fetchQueries]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [page, pathname, router]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-8">
      <div className="mx-auto container rounded-2xl border border-[#EEE4D8] bg-white p-5 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-playfair text-[#2D2424]">
              Contact Queries
            </h1>
            <p className="text-gray-500">
              Manage messages submitted from Contact Us form
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-full border border-[#D7C2A7] px-4 py-2 text-sm font-semibold text-[#6E2F2F] hover:bg-[#FBF6ED] transition cursor-pointer"
          >
            Home
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-[#F2E9DE]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FBF6ED] text-[#6E2F2F] text-sm uppercase tracking-wider">
                <th className="p-4">Full Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Query Type</th>
                <th className="p-4">Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    Loading contact queries...
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">
                    No queries found.
                  </td>
                </tr>
              ) : (
                queries.map((item, idx) => (
                  <tr
                    key={item?._id || `query-${idx}`}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-semibold text-[#2D2424]">
                      {item?.fullName || "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {item?.phoneNumber || "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {item?.emailAddress || "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {item?.queryType || "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 max-w-[360px] break-words">
                      {item?.message || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page {page} of {Math.max(totalPages, 1)}
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

