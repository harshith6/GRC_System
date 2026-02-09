import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);

      // On success, navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle errors
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);

      // Check if it's a network error (server down)
      if (!err.response) {
        setError(
          "Unable to connect to server. Please check if the backend server is running.",
        );
      } else if (err.response?.data?.error) {
        // Error message from backend
        setError(err.response.data.error);
      } else if (err.response?.data) {
        // Check for serializer validation errors (field-level errors)
        const data = err.response.data;
        const errors = [];

        // Format field-level errors
        for (const [field, messages] of Object.entries(data)) {
          const messageText = Array.isArray(messages)
            ? messages.join(", ")
            : messages;
          errors.push(messageText);
        }

        if (errors.length > 0) {
          setError(errors.join(" "));
        } else {
          setError("Login failed. Please try again later.");
        }
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError("Login failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="card">
          {/* Header inside card */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back to GRC System
            </h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>

          {/* Login form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn btn-primary py-3 text-base"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <Link
                to="/register"
                className="w-full inline-block btn btn-secondary py-3 text-base"
              >
                Create a new account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
