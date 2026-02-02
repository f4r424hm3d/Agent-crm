import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumb = ({ items }) => {
  const location = useLocation();

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <FiChevronRight className="mx-2 text-gray-400" size={16} />
            )}
            {item.path ? (
              <Link
                to={item.path}
                className={`text-sm ${
                  location.pathname === item.path
                    ? "text-primary-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
