import React from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";

const Alert = ({ type = "info", message, onClose, className = "" }) => {
  const typeConfig = {
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      icon: <FiCheckCircle className="text-green-500" size={20} />,
    },
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      icon: <FiXCircle className="text-red-500" size={20} />,
    },
    warning: {
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      icon: <FiAlertCircle className="text-amber-500" size={20} />,
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      icon: <FiInfo className="text-blue-500" size={20} />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`flex items-start p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className={`ml-3 flex-1 ${config.textColor}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-3 flex-shrink-0 ${config.textColor} hover:opacity-75`}
        >
          <FiX size={20} />
        </button>
      )}
    </div>
  );
};

export default Alert;
