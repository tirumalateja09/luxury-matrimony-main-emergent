"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminRole, setAdminRole] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [adminId, setAdminId] = useState("");

  // On mount, restore from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("adminRole");
      const storedName = localStorage.getItem("adminName");
      const storedId   = localStorage.getItem("adminId");
      if (storedRole) setAdminRole(storedRole);
      if (storedName) setAdminName(storedName);
      if (storedId)   setAdminId(storedId);
    }
  }, []);

  const updateAdmin = useCallback((role, name, id) => {
    setAdminRole(role || "admin");
    setAdminName(name || "");
    setAdminId(id || "");
    if (typeof window !== "undefined") {
      localStorage.setItem("adminRole", role || "admin");
      localStorage.setItem("adminName", name || "");
      localStorage.setItem("adminId",   id   || "");
    }
  }, []);

  const clearAdmin = useCallback(() => {
    setAdminRole(null);
    setAdminName("");
    setAdminId("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminToken");
    }
  }, []);

  const isSuperAdmin = adminRole === "super_admin";

  return (
    <AdminContext.Provider value={{ adminRole, adminName, adminId, isSuperAdmin, updateAdmin, clearAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used inside AdminProvider");
  return ctx;
}
