import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Package, Calendar, EyeIcon } from "lucide-react";
import { Stock } from "../../types";

interface StockCardProps {
  stock: Stock;
  onDelete: (id: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${stock.name}"?`)) {
      onDelete(stock.id);
    }
  };

  const getQuantityDisplay = () => {
    if (stock.quantity === null) {
      return "Not tracked";
    }
    return stock.quantity.toString();
  };

  const getQuantityColor = () => {
    if (stock.quantity === null) {
      return "text-gray-500";
    }
    if (stock.quantity === 0) {
      return "text-red-600";
    }
    if (stock.quantity < 10) {
      return "text-yellow-600";
    }
    return "text-green-600";
  };

  return (
    <div className="card animate-fade-in">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link
              to={`/stock/view/${stock.id}`}
              className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer block"
            >
              {stock.name}
            </Link>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Package size={16} className="mr-2 text-gray-400" />
                <span>Quantity: </span>
                <span className={`font-medium ml-1 ${getQuantityColor()}`}>
                  {getQuantityDisplay()}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span>Added {formatDate(stock.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className={`text-2xl font-bold mb-1 ${getQuantityColor()}`}>
              {stock.quantity !== null ? stock.quantity : "—"}
            </div>
            <div className="badge badge-primary">
              {stock.quantity !== null ? "Tracked" : "Untracked"}
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500 font-medium">
            ID: {stock.id}
          </span>
        </div>
        <div className="flex space-x-1">
          <Link
            to={`/stock/view/${stock.id}`}
            className="action-btn action-btn-primary"
            title="View stock details"
          >
            <EyeIcon size={16} />
          </Link>
          <Link
            to={`/stock/edit/${stock.id}`}
            className="action-btn action-btn-primary"
            title="Edit stock"
          >
            <Edit2 size={16} />
          </Link>

          <button
            onClick={handleDelete}
            className="action-btn action-btn-danger"
            title="Delete stock"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
