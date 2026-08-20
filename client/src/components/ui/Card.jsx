import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  className = '', 
  interactive = false, 
  padding = 'md',
  onClick,
  ...props 
}) => {
  const baseClass = 'ui-card';
  const interactiveClass = interactive || onClick ? 'ui-card-interactive' : '';
  const paddingClass = `ui-card-p-${padding}`; // none, sm, md, lg

  return (
    <div 
      className={`${baseClass} ${interactiveClass} ${paddingClass} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
