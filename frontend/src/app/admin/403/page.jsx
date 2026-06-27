"use client";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";

export default function Page403() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center">
            <ShieldX size={40} className="text-red-500" />
          </div>
        </div>
        <h1 className="font-playfair text-4xl font-bold text-[#2D2424] mb-3">403</h1>
        <h2 className="text-xl font-semibold text-stone-600 mb-3">Access Denied</h2>
        <p className="text-stone-500 mb-8 text-sm">
          You don&apos;t have permission to view this page. This area is restricted to
          <span className="font-semibold text-[#6E2F2F]"> Super Admin</span> only.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-full border border-[#D7C2A7] text-[#6E2F2F] font-semibold text-sm hover:bg-[#FBF6ED] transition cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="px-5 py-2.5 rounded-full bg-[#6E2F2F] text-white font-semibold text-sm hover:bg-[#5A2424] transition cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
