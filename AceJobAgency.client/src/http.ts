import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5117",
});

// Add a request interceptor
http.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    let accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (config.data && config.data.user) {
      delete config.data.user;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
http.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.clear();
      window.location.assign("/error");
    }
    return Promise.reject(error);
  }
);

export function login(token: string) {
  setAccessToken(token);
  window.location.reload();
}

export function logout() {
  clearAccessToken();
  window.location.reload();
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(token: string) {
  clearAccessToken();
  localStorage.setItem("accessToken", token);
}

function clearAccessToken() {
  localStorage.clear();
}

export default http;
