/**
 * Register Page Component
 *
 * Allows new users to create an account.
 * Includes form validation and password confirmation.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Handle input field changes.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  /**
   * Validate form data before submission.
   */
  const validateForm = () => {
    const newErrors = {};

    // Check required fields
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.password2)
      newErrors.password2 = "Please confirm your password";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Check password match
    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    // Check password length
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    return newErrors;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Attempt to register
      await register(formData);

      // On success, navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle errors from the server
      console.error("Registration error:", err);

      // Check if it's a network error (server down)
      if (!err.response) {
        setErrors({
          general:
            "Unable to connect to server. Please check if the backend server is running.",
        });
      } else if (err.response?.data) {
        // Server returned validation errors
        setErrors(err.response.data);
      } else {
        setErrors({
          general: "Registration failed. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-md w-full">
        {/* Registration Card */}
        <div className="card">
          {/* Header inside card */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600">Join GRC Checklist today</p>
          </div>

          {/* Registration form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* General error message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              {/* Username field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username <span className="text-red-600">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={`input ${
                    errors.username
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

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
                  className={`input ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* First and Last name - side by side on larger screens */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="input"
                    placeholder="Harshith"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className="input"
                    placeholder="K C"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
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
                  className={`input ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm password field */}
              <div>
                <label
                  htmlFor="password2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  className={`input ${
                    errors.password2
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Re-enter your password"
                  value={formData.password2}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.password2 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password2}
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full btn btn-primary py-3 text-base"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
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

            {/* Sign in link */}
            <div className="text-center">
              <Link
                to="/login"
                className="w-full inline-block btn btn-secondary py-3 text-base"
              >
                Sign in to existing account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
