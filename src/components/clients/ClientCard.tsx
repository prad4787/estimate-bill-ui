import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, MapPin, FileText } from 'lucide-react';
import { Client } from '../../types';

interface ClientCardProps {
  client: Client;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${client.name}"?`)) {
      onDelete(client.id);
    }
  };

  return (
    <div className="card group">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {client.name}
            </h3>
            
            {client.panVat && (
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <FileText size={14} className="mr-1" />
                <span>{client.panVat}</span>
              </div>
            )}
            
            {client.address && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin size={14} className="mr-1" />
                <span>{client.address}</span>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <span>Added on {formatDate(client.createdAt)}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-medium">
              {formatCurrency(client.openingBalance)}
            </div>
            <div className="text-xs text-gray-500">
              Opening Balance
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500">
            Client ID: {client.id.substring(0, 8)}...
          </span>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/clients/edit/${client.id}`}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-md transition-colors"
            title="Edit client"
          >
            <Edit2 size={16} />
          </Link>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-colors"
            title="Delete client"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;