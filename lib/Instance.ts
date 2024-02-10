import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `https://${process.env.EXPO_PUBLIC_BASE_URL}/api`,
});

axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
