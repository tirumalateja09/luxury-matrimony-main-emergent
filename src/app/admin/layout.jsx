"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        localStorage.removeItem("adminToken");
        if (isMounted) {
          setIsAuthorized(false);
          setIsAuthChecking(false);
        }
        router.replace("/adminlogin");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/token-status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const response = await res.json().catch(() => ({}));
        const isValid = response?.success && response?.valid && !response?.expired;

        if (!isValid) {
          localStorage.removeItem("adminToken");
          if (isMounted) {
            setIsAuthorized(false);
            setIsAuthChecking(false);
          }
          router.replace("/adminlogin");
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
        if (isMounted) {
          setIsAuthorized(false);
        }
        router.replace("/adminlogin");
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isAuthChecking || !isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
   
      <main className="flex-1">
        {children}
     
      </main>
    </div>
  );
}
