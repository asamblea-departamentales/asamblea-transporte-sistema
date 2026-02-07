import axios from "axios";

export const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://examines-louisville-infant-remote.trycloudflare.com",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
