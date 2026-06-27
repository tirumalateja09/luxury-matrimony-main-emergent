"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      // const data = await res.json();
      const text = await res.text();

      console.log("RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
        throw new Error("Server returned HTML instead of JSON");
      }
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", data.admin?.role || "admin");
      localStorage.setItem("adminName", data.admin?.name || "");
      router.push("/admin"); // admin dashboard  redirect
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBF6ED]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src="/icon.png"
            alt="RVR Luxury Matrimony"
            fill
            className="object-contain object-center md:object-left"
          />
        </div>
        <h1 className="text-2xl font-playfair font-bold text-[#2D2424] mb-6">
          Admin Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full text-gray-800 p-3 mb-4 border rounded-full outline-none focus:ring-2 focus:ring-[#E3B450]"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full  text-gray-800 p-3 mb-6 border rounded-full outline-none focus:ring-2 focus:ring-[#E3B450]"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full cursor-pointer py-3 rounded-full bg-gradient-to-r from-[#E3B450] to-[#CAA043] text-white font-bold">
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>
    </div>
  );
}
