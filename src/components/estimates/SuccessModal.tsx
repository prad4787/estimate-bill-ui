import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, Download } from 'lucide-react';

interface SuccessModalProps {
  estimateId: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ estimateId, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/estimates');
    }, 30000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-6 text-center">
          <div className="text-green-500 flex justify-center mb-4">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Estimate Created!</h2>
          <p className="text-gray-600 mb-6">
            Your estimate has been created successfully.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {/* Implement print functionality */}}
              className="btn btn-outline w-full inline-flex items-center justify-center"
            >
              <Printer size={16} className="mr-2" />
              Print Estimate
            </button>
            <button
              onClick={() => {/* Implement download functionality */}}
              className="btn btn-outline w-full inline-flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => navigate('/estimates/add')}
              className="btn btn-primary w-full"
            >
              Create Another Estimate
            </button>
            <button
              onClick={() => navigate('/estimates')}
              className="btn btn-outline w-full"
            >
              Go to Estimates List
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            This window will automatically close in 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;