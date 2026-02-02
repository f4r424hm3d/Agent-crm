import React from "react";
import { FiInbox } from "react-icons/fi";

const EmptyState = ({ icon: Icon = FiInbox, title, message, action }) => {
  return (
    <div className="empty-state">
      <Icon size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-500 mb-4 max-w-md">{message}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
