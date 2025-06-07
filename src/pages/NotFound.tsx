import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-yellow-500 mb-4">
        <AlertTriangle size={64} />
      </div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="btn btn-primary"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFound;