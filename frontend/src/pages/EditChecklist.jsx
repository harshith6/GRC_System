import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checklistAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert, { SuccessAlert } from "../components/ErrorAlert";

const EditChecklist = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    due_date: "",
    status: "draft",
  });

  // Validation errors
  const [errors, setErrors] = useState({});


  useEffect(() => {
    fetchChecklist();
  }, [id]);


  const fetchChecklist = async () => {
    try {
      const response = await checklistAPI.getById(id);
      const checklist = response.data;

      // Populate form with existing data
      setFormData({
        name: checklist.name,
        description: checklist.description || "",
        due_date: checklist.due_date || "",
        status: checklist.status,
      });
    } catch (err) {
      console.error("Error fetching checklist:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = "Checklist name is required";
    }

    // Due date is required
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      if (selectedDate < today) {
        newErrors.due_date = "Due date should not be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await checklistAPI.update(id, formData);

      // Show success message
      setSuccessMessage("Checklist updated successfully!");
      setTimeout(() => {
        navigate(`/checklists/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating checklist:", err);
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle array of error messages
        if (Array.isArray(errorData)) {
          setErrors({
            general: errorData.join(", "),
          });
        }
        // Handle non_field_errors
        else if (errorData.non_field_errors) {
          setErrors({
            general: Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors.join(", ")
              : errorData.non_field_errors,
          });
        }
        // Handle field-specific errors
        else if (typeof errorData === "object" && !errorData.error && !errorData.detail) {
          setErrors(errorData);
        }
        // Handle detail or error message
        else if (errorData.detail || errorData.error) {
          setErrors({
            general: errorData.detail || errorData.error,
          });
        }
        // Fallback
        else {
          setErrors({
            general: "Failed to update checklist",
          });
        }
      } else if (!err.response) {
        setErrors({
          general:
            "Unable to connect to server. Please check if the backend is running.",
        });
      } else {
        setErrors({ general: "Failed to update checklist. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingSpinner message="Loading checklist..." />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Checklist</h1>
        <p className="mt-2 text-gray-600">Update the checklist information</p>
      </div>

      {/* Success alert */}
      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Error alert */}
      <ErrorAlert error={error} onClose={() => setError(null)} />

      {/* General form errors */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errors.general}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        {/* Name field */}
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Checklist Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Q1 2026 Compliance Review"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description field */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Provide details about this checklist..."
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Due date and status row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Due date field */}
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.due_date ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
            )}
          </div>

          {/* Status field */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? "Updating..." : "Update Checklist"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/checklists/${id}`)}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditChecklist;
