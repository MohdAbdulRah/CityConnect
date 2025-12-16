const axios = require("axios");
const { API_BASE_URL } = require("../config");

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Important for some ngrok setups
    "ngrok-skip-browser-warning": "true",
  },
});

module.exports = API;
