import axios from "axios";

export async function handleSignIn({ email, password }, data) {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/auth/login", // Updated URL to match FastAPI backend
      { email, password, data },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Login success", response.data);
    // Store token in localStorage or handle it as needed
    localStorage.setItem("token", response.data.access_token);
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error("Login error", err.response.data); // Server-side error
    } else {
      console.error("Request error", err.message); // Client-side error
    }
  }
}
