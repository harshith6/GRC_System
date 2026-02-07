import React from 'react';

const StatusBadge = ({ status }) => {
  // Map status values to badge styles
  const getBadgeClass = () => {
    const statusLower = status.toLowerCase();
    
    // Checklist statuses
    if (statusLower === 'draft') return 'badge-draft';
    if (statusLower === 'active') return 'badge-active';
    if (statusLower === 'completed') return 'badge-completed';
    
    // Item statuses
    if (statusLower === 'pending') return 'badge-pending';
    if (statusLower === 'in-progress' || statusLower === 'in progress') return 'badge-in-progress';
    if (statusLower === 'not-applicable' || statusLower === 'not applicable') return 'badge-draft';
    
    // Default
    return 'badge-draft';
  };
  
  // Format status text for display
  const formatStatus = () => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <span className={`badge ${getBadgeClass()}`}>
      {formatStatus()}
    </span>
  );
};

export default StatusBadge;
