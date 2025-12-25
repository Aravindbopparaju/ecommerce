import React, { useState } from "react";
import "./CSS/LoginSignup.css";

// 🌍 LIVE BACKEND URL
const BACKEND_URL = "https://ecommerce-backend-kitz.onrender.com";

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async () => {
    try {
      const endpoint =
        state === "Login" ? "/login" : "/signup";

      const bodyData =
        state === "Login"
          ? {
              email: formData.email,
              password: formData.password,
            }
          : formData;

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Failed to fetch. Backend not reachable.");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>

        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <input
              type="text"
              placeholder="Your Name"
              name="username"
              value={formData.username}
              onChange={changeHandler}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
          />
        </div>

        <button onClick={submitHandler}>
          Continue
        </button>

        {state === "Login" ? (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>
              Click here
            </span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>
              Login here
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
