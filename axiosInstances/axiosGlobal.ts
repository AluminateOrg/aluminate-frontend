import axios from "axios";

const apiUrl =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") +
  (process.env.NEXT_PUBLIC_API_PREFIX ?? "");
const axiosGlobal = axios.create({
  baseURL: apiUrl,
  withCredentials: true, 
});
// No interceptor needed for CSRF here

export default axiosGlobal;
