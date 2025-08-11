import axios from "axios";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const apiUrl =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") +
  (process.env.NEXT_PUBLIC_API_PREFIX ?? "") + "/admin";

const axiosAdmin = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // ensures sessionId and JWT are sent via cookies
});

axiosAdmin.interceptors.request.use(config => {
  const csrfToken = getCookie("csrf-token");
  const sessionId = getCookie("sessionId");
  

  // Attach CSRF token and sessionId to headers if they exist
  if (csrfToken && config.headers) {
    config.headers["X-Csrf-Token"] = csrfToken;
  }

  if (sessionId && config.headers) {
    config.headers["X-Session-Id"] = sessionId;
  }
  return config;
}, error => Promise.reject(error));

export default axiosAdmin;
