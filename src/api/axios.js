import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  }

  
});
console.log("PROD URL:", import.meta.env.VITE_API_BASE_URL);

export default api;


// import axios from "axios";

// const isDevelopment = import.meta.env.MODE === "development";

// const myBaseURL = isDevelopment
//   ? import.meta.env.VITE_API_BASE_URL
//   : import.meta.env.VITE_API_BASE_URL_DEPLOY;

// const api = axios.create({
//   baseURL: myBaseURL,
//   timeout: 5000,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   accept: "application/json",
//   withCredentials: false, // No login yet
// });

// export default api;

