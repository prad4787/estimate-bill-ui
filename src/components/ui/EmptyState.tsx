import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon, 
  action 
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="empty-state">
          {icon && (
            <div className="empty-state-icon">
              {icon}
            </div>
          )}
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8 max-w-md leading-relaxed">{description}</p>
          {action}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;