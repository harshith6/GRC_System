import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { checklistAPI, itemAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import ErrorAlert, { SuccessAlert } from "../components/ErrorAlert";

const ChecklistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
  const [itemErrors, setItemErrors] = useState({}); // Track validation errors for item forms
  const [deleteItemModal, setDeleteItemModal] = useState({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });
  const [deleteChecklistModal, setDeleteChecklistModal] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState(""); // Search items

  // New item form data
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    assigned_owner: "",
    status: "pending",
    evidence_notes: "",
  });

  useEffect(() => {
    fetchChecklist();
  }, [id]);

  const fetchChecklist = async () => {
    try {
      const response = await checklistAPI.getById(id);
      setChecklist(response.data);
    } catch (err) {
      console.error("Error fetching checklist:", err);
      setError("Failed to load checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newItem.title.trim()) {
      setItemErrors({ title: "Item title is required" });
      return;
    }

    setItemErrors({});

    try {
      await checklistAPI.addItem(id, newItem);
      setNewItem({
        title: "",
        description: "",
        assigned_owner: "",
        status: "pending",
        evidence_notes: "",
      });
      setShowAddItem(false);
      setSuccessMessage("Item added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchChecklist(); // Refresh
    } catch (err) {
      console.error("Error adding item:", err);

      if (err.response?.data) {
        // Handle field-specific errors from backend
        if (typeof err.response.data === "object" && !err.response.data.error) {
          setItemErrors(err.response.data);
        } else {
          const errorMsg = err.response.data.error || "Failed to add item";
          setItemErrors({ general: errorMsg });
        }
      } else if (!err.response) {
        setItemErrors({
          general:
            "Unable to connect to server. Please check if the backend is running.",
        });
      } else {
        setItemErrors({ general: "Failed to add item. Please try again." });
      }
    }
  };

  const handleItemStatusChange = async (itemId, newStatus) => {
    try {
      await itemAPI.patch(itemId, { status: newStatus });
      setSuccessMessage("Item status updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchChecklist(); // Refresh
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleChecklistStatusChange = async (newStatus) => {
    try {
      await checklistAPI.patch(id, { status: newStatus });
      setSuccessMessage("Checklist status updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchChecklist(); // Refresh
    } catch (err) {
      console.error("Error updating checklist status:", err);

      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle array of error messages
        if (Array.isArray(errorData)) {
          setError(errorData.join(", "));
        }
        // Handle non_field_errors
        else if (errorData.non_field_errors) {
          setError(
            Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors.join(", ")
              : errorData.non_field_errors,
          );
        }
        // Handle detail or error message
        else if (errorData.detail || errorData.error) {
          setError(errorData.detail || errorData.error);
        }
        // Fallback
        else {
          setError("Failed to update checklist status");
        }
      } else {
        setError("Failed to update checklist status");
      }

      setTimeout(() => setError(""), 5000);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      description: item.description || "",
      assigned_owner: item.assigned_owner || "",
      status: item.status,
      evidence_notes: item.evidence_notes || "",
    });
    // Clear errors when starting to edit
    setItemErrors({});
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!editingItem.title.trim()) {
      setItemErrors({
        [`edit_${editingItem.id}`]: { title: "Item title is required" },
      });
      return;
    }

    setItemErrors({});

    try {
      const { id: itemId, ...updateData } = editingItem;
      await itemAPI.patch(itemId, updateData);
      setEditingItem(null);
      setSuccessMessage("Item updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchChecklist(); // Refresh
    } catch (err) {
      console.error("Error updating item:", err);

      if (err.response?.data) {
        // Handle field-specific errors from backend
        if (typeof err.response.data === "object" && !err.response.data.error) {
          setItemErrors({ [`edit_${editingItem.id}`]: err.response.data });
        } else {
          const errorMsg = err.response.data.error || "Failed to update item";
          setItemErrors({ [`edit_${editingItem.id}`]: { general: errorMsg } });
        }
      } else if (!err.response) {
        setItemErrors({
          [`edit_${editingItem.id}`]: {
            general:
              "Unable to connect to server. Please check if the backend is running.",
          },
        });
      } else {
        setItemErrors({
          [`edit_${editingItem.id}`]: {
            general: "Failed to update item. Please try again.",
          },
        });
      }
    }
  };

  const handleDeleteItemClick = (item) => {
    setDeleteItemModal({
      isOpen: true,
      itemId: item.id,
      itemTitle: item.title,
    });
  };

  const handleDeleteItemConfirm = async () => {
    try {
      await itemAPI.delete(deleteItemModal.itemId);
      setDeleteItemModal({ isOpen: false, itemId: null, itemTitle: "" });
      setSuccessMessage("Item deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchChecklist();
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item");
      setDeleteItemModal({ isOpen: false, itemId: null, itemTitle: "" });
    }
  };

  const handleDeleteChecklistClick = () => {
    setDeleteChecklistModal(true);
  };

  const handleDeleteChecklistConfirm = async () => {
    try {
      await checklistAPI.delete(id);
      setSuccessMessage("Checklist deleted successfully!");
      setTimeout(() => {
        navigate("/checklists");
      }, 1500);
    } catch (err) {
      console.error("Error deleting checklist:", err);
      setError("Failed to delete checklist");
      setDeleteChecklistModal(false);
    }
  };

  // Filter items based on search term
  const filteredItems =
    checklist?.items?.filter((item) => {
      if (!itemSearchTerm) return true;
      const searchLower = itemSearchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower)) ||
        (item.assigned_owner &&
          item.assigned_owner.toLowerCase().includes(searchLower))
      );
    }) || [];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!checklist) return <div className="p-8">Checklist not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success alert */}
      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/checklists"
          className="text-gray-900 hover:text-gray-700 font-medium"
        >
          ← Back to Checklists
        </Link>
      </div>

      {/* Checklist header */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {checklist.name}
            </h1>
            <p className="text-gray-600 mt-2">{checklist.description}</p>
          </div>
          <StatusBadge status={checklist.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">Due Date:</span>
            <p className="font-medium">
              {checklist.due_date
                ? new Date(checklist.due_date).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Created By:</span>
            <p className="font-medium">{checklist.created_by_username}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Progress:</span>
            <p className="font-medium">
              {checklist.completion_percentage != null
                ? checklist.completion_percentage.toFixed(0)
                : 0}
              %
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={checklist.status}
              onChange={(e) => handleChecklistStatusChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <Link
            to={`/checklists/${id}/edit`}
            className="btn btn-secondary text-sm"
          >
            Edit Details
          </Link>
          <button
            onClick={() => setShowAddItem(true)}
            className="btn btn-primary"
          >
            + Add Item
          </button>
          <button
            onClick={handleDeleteChecklistClick}
            className="btn bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Checklist
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="Add New Item"
        size="md"
      >
        {itemErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {itemErrors.general}
          </div>
        )}

        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className={`input ${
                itemErrors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              value={newItem.title}
              onChange={(e) => {
                setNewItem({ ...newItem, title: e.target.value });
                if (itemErrors.title)
                  setItemErrors({ ...itemErrors, title: "" });
              }}
              placeholder="e.g., Review security policies"
            />
            {itemErrors.title && (
              <p className="mt-1 text-sm text-red-600">{itemErrors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input"
              rows="3"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              placeholder="Provide additional details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Owner
            </label>
            <input
              type="text"
              className="input"
              value={newItem.assigned_owner}
              onChange={(e) =>
                setNewItem({ ...newItem, assigned_owner: e.target.value })
              }
              placeholder="e.g., Harshith K C"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidence/Notes
            </label>
            <textarea
              className="input"
              rows="2"
              value={newItem.evidence_notes}
              onChange={(e) =>
                setNewItem({ ...newItem, evidence_notes: e.target.value })
              }
              placeholder="Add any supporting evidence or notes"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Add Item
            </button>
            <button
              type="button"
              onClick={() => setShowAddItem(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Edit Item"
        size="md"
      >
        {editingItem && itemErrors[`edit_${editingItem.id}`]?.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
            {itemErrors[`edit_${editingItem.id}`].general}
          </div>
        )}

        {editingItem && (
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-600\">*</span>
              </label>
              <input
                type="text"
                className={`input ${
                  itemErrors[`edit_${editingItem.id}`]?.title
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                value={editingItem.title}
                onChange={(e) => {
                  setEditingItem({ ...editingItem, title: e.target.value });
                  if (itemErrors[`edit_${editingItem.id}`]?.title) {
                    const newErrors = { ...itemErrors };
                    delete newErrors[`edit_${editingItem.id}`].title;
                    setItemErrors(newErrors);
                  }
                }}
              />
              {itemErrors[`edit_${editingItem.id}`]?.title && (
                <p className="mt-1 text-sm text-red-600">
                  {itemErrors[`edit_${editingItem.id}`].title}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input"
                rows="2"
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Owner
                </label>
                <input
                  type="text"
                  className="input"
                  value={editingItem.assigned_owner}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      assigned_owner: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="input"
                  value={editingItem.status}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="not-applicable">Not Applicable</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evidence/Notes
              </label>
              <textarea
                className="input"
                rows="2"
                value={editingItem.evidence_notes}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    evidence_notes: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Items list */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Items</h2>

        {/* Items Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search items by title, description, or assigned owner..."
              className="input pl-10 w-full"
              value={itemSearchTerm}
              onChange={(e) => setItemSearchTerm(e.target.value)}
            />
            {itemSearchTerm && (
              <button
                onClick={() => setItemSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          {itemSearchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredItems.length} item
              {filteredItems.length !== 1 ? "s" : ""} matching "{itemSearchTerm}
              "
            </p>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="space-y-4 pr-2 max-h-[400px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div key={item.id} className="card">
                {/* View mode */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-2">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                  {item.assigned_owner && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Owner:{" "}
                      <span className="font-medium">{item.assigned_owner}</span>
                    </span>
                  )}
                  {item.completed_at && (
                    <span>
                      ✓ Completed:{" "}
                      {new Date(item.completed_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {item.evidence_notes && (
                  <div className="bg-gray-50 p-2 rounded text-sm mb-2">
                    <span className="font-medium">Evidence/Notes:</span>{" "}
                    {item.evidence_notes}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleItemStatusChange(item.id, e.target.value)
                    }
                    className="text-sm border border-gray-300 rounded px-3 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="not-applicable">Not Applicable</option>
                  </select>
                  <button
                    onClick={() => handleEditItem(item)}
                    className="btn btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItemClick(item)}
                    className="btn bg-red-600 hover:bg-red-700 text-white text-sm shadow-sm focus:ring-red-500 flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {itemSearchTerm ? (
              <>
                No items found matching "{itemSearchTerm}".
                <button
                  onClick={() => setItemSearchTerm("")}
                  className="block mx-auto mt-2 text-gray-900 hover:text-gray-700 font-medium underline"
                >
                  Clear search
                </button>
              </>
            ) : checklist.items && checklist.items.length > 0 ? (
              "No items match your search."
            ) : (
              "No items yet. Add your first item above."
            )}
          </p>
        )}
      </div>

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={deleteItemModal.isOpen}
        onClose={() =>
          setDeleteItemModal({ isOpen: false, itemId: null, itemTitle: "" })
        }
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the item{" "}
            <span className="font-semibold">{deleteItemModal.itemTitle}</span>?
          </p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDeleteItemConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
            <button
              onClick={() =>
                setDeleteItemModal({
                  isOpen: false,
                  itemId: null,
                  itemTitle: "",
                })
              }
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Checklist Confirmation Modal */}
      <Modal
        isOpen={deleteChecklistModal}
        onClose={() => setDeleteChecklistModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the checklist{" "}
            <span className="font-semibold">{checklist?.name}</span>?
          </p>
          <p className="text-sm text-gray-600">
            This will permanently delete the checklist and all its items. This
            action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDeleteChecklistConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
            <button
              onClick={() => setDeleteChecklistModal(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChecklistDetail;
