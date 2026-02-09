import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checklistAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SuccessAlert } from '../components/ErrorAlert';

const ChecklistList = () => {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, draft, active, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', due_date: '', status: 'draft' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, checklistId: null, checklistName: '' });
  
  useEffect(() => {
    fetchChecklists();
  }, [filter]);
  
  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await checklistAPI.getAll(params);
      setChecklists(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching checklists:', err);
      setError('Failed to load checklists');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (e, checklist) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, checklistId: checklist.id, checklistName: checklist.name });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await checklistAPI.delete(deleteConfirmModal.checklistId);
      setChecklists(checklists.filter(c => c.id !== deleteConfirmModal.checklistId));
      setDeleteConfirmModal({ isOpen: false, checklistId: null, checklistName: '' });
      setError(''); // Clear any existing errors
      setSuccessMessage('Checklist deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting checklist:', err);
      setSuccessMessage(''); // Clear any existing success messages
      setError('Failed to delete checklist');
      setTimeout(() => setError(''), 3000);
      setDeleteConfirmModal({ isOpen: false, checklistId: null, checklistName: '' });
    }
  };
  
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Checklist name is required';
    if (formData.name.length > 200) errors.name = 'Name cannot exceed 200 characters';
    if (!formData.due_date) {
      errors.due_date = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) errors.due_date = 'Due date cannot be in the past';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      const response = await checklistAPI.create(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', due_date: '', status: 'draft' });
      navigate(`/checklists/${response.data.id}`);
    } catch (err) {
      console.error('Error creating checklist:', err);
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle array of error messages
        if (Array.isArray(errorData)) {
          setFormErrors({
            general: errorData.join(", "),
          });
        }
        // Handle non_field_errors
        else if (errorData.non_field_errors) {
          setFormErrors({
            general: Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors.join(", ")
              : errorData.non_field_errors,
          });
        }
        // Handle field-specific errors
        else if (typeof errorData === 'object' && !errorData.error && !errorData.detail) {
          const fieldErrors = {};
          Object.keys(errorData).forEach((field) => {
            fieldErrors[field] = Array.isArray(errorData[field])
              ? errorData[field][0]
              : errorData[field];
          });
          setFormErrors(fieldErrors);
        }
        // Handle detail or error message
        else if (errorData.detail || errorData.error) {
          setFormErrors({
            general: errorData.detail || errorData.error,
          });
        }
        // Fallback
        else {
          setFormErrors({
            general: 'Failed to create checklist',
          });
        }
      } else if (!err.response) {
        setFormErrors({ general: 'Unable to connect to server. Please check if the backend is running.' });
      } else {
        setFormErrors({ general: 'Failed to create checklist. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEditClick = async (e, checklist) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingChecklist(checklist);
    setFormData({
      name: checklist.name,
      description: checklist.description || '',
      due_date: checklist.due_date || '',
      status: checklist.status
    });
    setIsEditModalOpen(true);
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Checklist name is required';
    if (formData.name.length > 200) errors.name = 'Name cannot exceed 200 characters';
    if (!formData.due_date) {
      errors.due_date = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) errors.due_date = 'Due date cannot be in the past';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      await checklistAPI.update(editingChecklist.id, formData);
      setIsEditModalOpen(false);
      setEditingChecklist(null);
      setFormData({ name: '', description: '', due_date: '', status: 'draft' });
      fetchChecklists(); // Refresh list
    } catch (err) {
      console.error('Error updating checklist:', err);
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle array of error messages
        if (Array.isArray(errorData)) {
          setFormErrors({
            general: errorData.join(", "),
          });
        }
        // Handle non_field_errors
        else if (errorData.non_field_errors) {
          setFormErrors({
            general: Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors.join(", ")
              : errorData.non_field_errors,
          });
        }
        // Handle field-specific errors
        else if (typeof errorData === 'object' && !errorData.error && !errorData.detail) {
          setFormErrors(errorData);
        }
        // Handle detail or error message
        else if (errorData.detail || errorData.error) {
          setFormErrors({
            general: errorData.detail || errorData.error,
          });
        }
        // Fallback
        else {
          setFormErrors({
            general: 'Failed to update checklist',
          });
        }
      } else if (!err.response) {
        setFormErrors({ general: 'Unable to connect to server. Please check if the backend is running.' });
      } else {
        setFormErrors({ general: 'Failed to update checklist. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filter checklists based on search term
  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return <LoadingSpinner message="Loading checklists..." />;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Alert */}
      {successMessage && (
        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checklists</h1>
          <p className="mt-2 text-gray-600">Manage your compliance checklists</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
          + Create Checklist
        </button>
      </div>
      
      {/* Create Checklist Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Checklist" size="md">
        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {formErrors.general}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className={`input ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              placeholder="e.g., Q1 2026 Compliance Review"
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this checklist..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={`input ${formErrors.due_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={formData.due_date}
              onChange={(e) => {
                setFormData({ ...formData, due_date: e.target.value });
                if (formErrors.due_date) setFormErrors({ ...formErrors, due_date: '' });
              }}
              required
            />
            {formErrors.due_date && <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Checklist'}
            </button>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Checklist Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingChecklist(null); }} title="Edit Checklist" size="md">
        {formErrors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {formErrors.general}
          </div>
        )}
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className={`input ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              placeholder="e.g., Q1 2026 Compliance Review"
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this checklist..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={`input ${formErrors.due_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={formData.due_date}
              onChange={(e) => {
                setFormData({ ...formData, due_date: e.target.value });
                if (formErrors.due_date) setFormErrors({ ...formErrors, due_date: '' });
              }}
              required
            />
            {formErrors.due_date && <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Checklist'}
            </button>
            <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingChecklist(null); }} className="btn btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Filters and search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Status filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'draft'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'active'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'completed'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search checklists..."
          className="input flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Checklist list */}
      {filteredChecklists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No checklists found</p>
          <Link to="/checklists/new" className="mt-4 inline-block text-gray-900 hover:text-gray-700 font-medium underline">
            Create your first checklist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecklists.map((checklist) => (
            <div
              key={checklist.id}
              className="card hover:shadow-lg transition-shadow duration-200 relative"
            >
              {/* Checklist card content - clickable to view details */}
              <Link to={`/checklists/${checklist.id}`} className="block">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {checklist.name}
                  </h3>
                  <StatusBadge status={checklist.status} />
                </div>
              
              {checklist.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {checklist.description}
                </p>
              )}
              
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{checklist.completion_percentage?.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${checklist.completion_percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{checklist.total_items} items</span>
                {checklist.due_date && (
                  <span>Due: {new Date(checklist.due_date).toLocaleDateString()}</span>
                )}
              </div>
              
              {checklist.is_overdue && (
                <div className="mt-2">
                  <span className="badge badge-overdue">Overdue</span>
                </div>
              )}
              </Link>
              
              {/* Action buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={(e) => handleEditClick(e, checklist)}
                  className="flex-1 btn btn-secondary text-sm py-2"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, checklist)}
                  className="flex-1 btn bg-red-600 hover:bg-red-700 text-white text-sm py-2 shadow-sm focus:ring-red-500 flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmModal.isOpen} 
        onClose={() => setDeleteConfirmModal({ isOpen: false, checklistId: null, checklistName: '' })} 
        title="Confirm Delete" 
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{deleteConfirmModal.checklistName}</span>?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone. All items in this checklist will also be deleted.
          </p>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleDeleteConfirm} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button 
              onClick={() => setDeleteConfirmModal({ isOpen: false, checklistId: null, checklistName: '' })} 
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

export default ChecklistList;
