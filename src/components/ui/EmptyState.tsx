import React from "react";

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
  action,
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="empty-state">
          {icon && <div className="empty-state-icon mb-4">{icon}</div>}
          <h3 className="card-title text-center">{title}</h3>
          <p className="card-subtitle text-center mb-6">{description}</p>
          {action && <div className="flex justify-center">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
