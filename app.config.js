// app.config.js
export default {
  expo: {
    name: "YourAppName",
    slug: "your-app-slug",
    version: "1.0.0",
    orientation: "portrait",
    jsEngine: "hermes",
    scheme: "yourapp",
    plugins: ["expo-router"],
    extra: {
      apiUrl: process.env.API_URL || "http://192.168.1.40:8000", // Fallback URL
    },
  },
};