import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, MapPin, FileText, Eye } from 'lucide-react';
import { Client } from '../../types';

interface ClientListItemProps {
  client: Client;
  onDelete: (id: string) => void;
}

const ClientListItem: React.FC<ClientListItemProps> = ({ client, onDelete }) => {
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
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {client.name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-4">
                {client.panVat && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText size={14} className="mr-1" />
                    <span>{client.panVat}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-1" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(client.openingBalance)}
            </div>
            <div className="text-sm text-gray-500">
              Opening Balance
            </div>
          </div>
          
          <div className="flex items-center gap-1">
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
      <div className="mt-3">
        <span className="text-sm text-gray-500">
          Added on {formatDate(client.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ClientListItem;