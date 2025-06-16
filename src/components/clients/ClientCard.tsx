import React from "react";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2, FileText, MapPin } from "lucide-react";
import { Client } from "../../types";

interface ClientCardProps {
  client: Client;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onDelete }) => {
  const formatCurrency = (amount: number | string) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericAmount);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${client.name}"?`)) {
      onDelete(client.id);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="card-title">{client.name}</h3>
            <div className="mt-2 flex flex-wrap gap-3">
              {client.panVat && (
                <div className="flex items-center text-sm text-secondary">
                  <FileText size={14} className="mr-1.5" />
                  <span>{client.panVat}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center text-sm text-secondary">
                  <MapPin size={14} className="mr-1.5" />
                  <span className="truncate max-w-[200px]">
                    {client.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="text-xl font-semibold text-primary mb-1">
              {formatCurrency(client.openingBalance)}
            </div>
            <div className="badge badge-primary badge-text">
              Opening Balance
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer flex justify-between items-center">
        <div>
          <span className="text-xs text-muted font-medium">
            ID: {client.id.toString().substring(0, 8)}...
          </span>
        </div>
        <div className="flex space-x-1.5">
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
