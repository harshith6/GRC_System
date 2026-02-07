import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import ErrorAlert from '../components/ErrorAlert';

const Dashboard = () => {
  // State for dashboard stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null); // Clear any previous errors
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err); // Pass the full error object to ErrorAlert
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }
  

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert error={error} onClose={() => setError(null)} />
        <button
          onClick={fetchStats}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your compliance checklists and items
          </p>
        </div>
        <Link to="/checklists/new" className="btn btn-primary">
          + Create New Checklist
        </Link>
      </div>
      
      {/* Statistics grid */}
      {stats && (
        <div className="space-y-8">
          {/* Checklist statistics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Checklist Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Checklists"
                value={stats.total_checklists}
                color="info"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              
              <StatCard
                title="Active Checklists"
                value={stats.active_checklists}
                color="primary"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Completed Checklists"
                value={stats.completed_checklists}
                color="success"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Overdue Checklists"
                value={stats.overdue_checklists}
                color="danger"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </div>
          
          {/* Item statistics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Item Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Items"
                value={stats.total_items}
                color="info"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                }
              />
              
              <StatCard
                title="Pending Items"
                value={stats.pending_items}
                color="warning"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              
              <StatCard
                title="In Progress Items"
                value={stats.in_progress_items}
                color="primary"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              
              <StatCard
                title="Completed Items"
                value={stats.completed_items}
                color="success"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </div>
          
          {/* Average completion */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Overall Progress
            </h2>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-700 bg-gray-100">
                        Average Completion
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-gray-700">
                        {stats.average_completion.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${stats.average_completion}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-800 transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Link to view all checklists */}
          <div className="text-center">
            <Link to="/checklists" className="text-gray-900 hover:text-gray-700 font-medium underline">
              View All Checklists →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
