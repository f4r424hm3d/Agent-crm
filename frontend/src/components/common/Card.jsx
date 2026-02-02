import React from "react";

const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <div className={`card ${className}`}>
      <div className={noPadding ? "" : "card-body"}>{children}</div>
    </div>
  );
};

Card.Header = ({ children, className = "" }) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

Card.Body = ({ children, className = "" }) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

Card.Footer = ({ children, className = "" }) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};

export default Card;
