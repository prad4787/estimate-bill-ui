import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, MapPin, FileText, Calendar, Eye } from 'lucide-react';
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
    <div className="card animate-fade-in">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {client.name}
            </h3>
            
            <div className="space-y-2">
              {client.panVat && (
                <div className="flex items-center text-sm text-gray-600">
                  <FileText size={16} className="mr-2 text-gray-400" />
                  <span>{client.panVat}</span>
                </div>
              )}
              
              {client.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span>Added {formatDate(client.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(client.openingBalance)}
            </div>
            <div className="badge badge-primary">
              Opening Balance
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-footer flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500 font-medium">
            ID: {client.id.substring(0, 8)}...
          </span>
        </div>
        <div className="flex space-x-1">
          <Link
            to={`/clients/view/${client.id}`}
            className="action-btn action-btn-primary"
            title="View client details"
          >
            <Eye size={16} />
          </Link>
          <Link
            to={`/clients/edit/${client.id}`}
            className="action-btn action-btn-primary"
            title="Edit client"
          >
            <Edit2 size={16} />
          </Link>
          <button
            onClick={handleDelete}
            className="action-btn action-btn-danger"
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