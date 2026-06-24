"use client";

import { usePathname } from "next/navigation";
import Navbar from "../component/Navbar";
import Footer from "../component/Home/Footer";

export default function PublicLayout({ children }) {
  const pathname = usePathname();

const hideRoutes = ["/register", "/language-selection"];

const hideNavbar = hideRoutes.some((route) =>
  pathname.startsWith(route)
);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}

      <main className="flex-1">
        {children}
        <Footer />
      </main>
    </div>
  );
}
