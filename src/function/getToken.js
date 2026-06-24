export const getToken = () => {
  // 1. Next.js Server-side check 
  if (typeof window === "undefined") return null;

  // 2.  storage key 
  const STORAGE_KEY = "rvr_auth_data"; 
  const data = localStorage.getItem(STORAGE_KEY);
  
  if (data) {
    try {
 
      const parsedData = JSON.parse(data);
      
   
      return parsedData?.token || null;
    } catch (e) {
      console.error("Auth Token Parse Error:", e);
      return null;
    }
  }
  
  return null;
};