import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'neutral', 
  className = '' 
}) => {
  const baseClass = 'ui-badge';
  const variantClass = `ui-badge-${variant}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default Badge;
