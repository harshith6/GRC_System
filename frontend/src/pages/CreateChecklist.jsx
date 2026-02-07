import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checklistAPI } from "../services/api";

const CreateChecklist = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    due_date: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = "Checklist name is required";
    } else if (formData.name.length > 200) {
      newErrors.name = "Name cannot exceed 200 characters";
    }

    // Due date is required
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.due_date = "Due date cannot be in the past";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await checklistAPI.create(formData);
      navigate(`/checklists/${response.data.id}`);
    } catch (err) {
      console.error("Error creating checklist:", err);

      // Handle backend validation errors
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object" && !data.error) {
          // This is DRF's field error format: { field: ['error message'] }
          const fieldErrors = {};
          Object.keys(data).forEach((field) => {
            fieldErrors[field] = Array.isArray(data[field])
              ? data[field][0]
              : data[field];
          });
          setErrors(fieldErrors);
        } else if (data.error && data.message) {
          // This is our custom error format from the exception handler
          setErrors({
            general: `${data.error}: ${data.message}`,
          });
        } else if (data.error) {
          setErrors({ general: data.error });
        } else if (typeof data === "string") {
          setErrors({ general: data });
        } else {
          setErrors({
            general: "Failed to create checklist. Please try again.",
          });
        }
      } else if (!err.response) {
        setErrors({
          general:
            "Unable to connect to server. Please check if the backend is running.",
        });
      } else {
        setErrors({
          general: `Error: ${err.response.status} - Failed to create checklist. Please try again.`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Create New Checklist
      </h1>

      {/* General error message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`input ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Q1 2026 Compliance Review"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className={`input ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose of this checklist..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              className={`input ${
                errors.due_date
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              value={formData.due_date}
              onChange={handleChange}
              required
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              className="input"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Checklist"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/checklists")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateChecklist;
