import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  // Color variants for different stat types
  const colorClasses = {
    primary: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <div className="card">
      <div className="flex items-center">
        {/* Icon */}
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
        
        {/* Content */}
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
