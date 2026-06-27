// utils/prokerala.js

export async function getProkeralaToken() {
  try {
    const response = await fetch(
      "https://api.prokerala.com/token",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.PROKERALA_CLIENT_ID,
          client_secret: process.env.PROKERALA_CLIENT_SECRET,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get token");
    }

    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.error("Token Error:", error);
    throw error;
  }
}