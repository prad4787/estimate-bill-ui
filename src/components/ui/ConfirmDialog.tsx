import React from "react";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = "default",
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    default: {
      button: "btn-primary",
      icon: "text-muted hover:text-secondary",
    },
    danger: {
      button: "btn-danger",
      icon: "text-muted hover:text-secondary",
    },
  };

  const classes = variantClasses[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className={`rounded-md bg-white ${classes.icon} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
              onClick={onCancel}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="modal-title">{title}</h3>
              <div className="mt-2">
                <p className="modal-subtitle">{message}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              className={`btn ${classes.button}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
