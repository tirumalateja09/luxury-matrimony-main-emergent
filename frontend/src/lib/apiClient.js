import { getToken } from "@/function/getToken";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getAdminToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminToken") || null;
};

export const request = async (method, endpoint, data = null, auth = "public") => {
    // 1. Token fetch — admin pages get adminToken, others get user token
    const token = auth === "admin" ? getAdminToken() : getToken();

    const headers = {};

    // 2. Body Type Check (JSON vs FormData)
    const isFormData = data instanceof FormData;

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    // 3. Authorization Header setup
    if (auth !== "public" && token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    // 4. Body handle karein
    if (data) {
        options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, options);

        // JSON parse karein aur empty response handle karein
        const responseData = await res
            .json()
            .catch(() => ({ message: "Invalid server response" }));

        // 5. Error Handling logic
        if (!res.ok) {
            // Agar token expire ho gaya ho (401), toh logout logic yahan laga sakte hain
            if (res.status === 401) {
                console.warn("Session expired. Please login again.");
            }
            
            // Error throw karein taaki frontend catch block mein jaye
            const error = new Error(responseData?.message || `Error ${res.status}`);
            error.status = res.status;
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        // console.error(`API ${method} ${endpoint} Failed:`, error.message);
        throw error; // Component handles this in try-catch
    }
};

// --- Helper Functions for Easy Use ---
export const api = {
    get: (url, auth = "public") => request("GET", url, null, auth),
    post: (url, data, auth = "public") => request("POST", url, data, auth),
    put: (url, data, auth = "public") => request("PUT", url, data, auth),
    patch: (url, data, auth = "public") => request("PATCH", url, data, auth),
    delete: (url, auth = "public") => request("DELETE", url, null, auth),
    del: (url, auth = "public") => request("DELETE", url, null, auth),
    postFile: (url, formData, auth = "private") => request("POST", url, formData, auth),
};