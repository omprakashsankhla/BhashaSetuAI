import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  iconLeft, 
  iconRight, 
  disabled = false, 
  loading = false,
  ...props 
}) => {
  const baseClass = 'ui-btn';
  const variantClass = `ui-btn-${variant}`;
  const sizeClass = `ui-btn-${size}`;
  const disabledClass = disabled || loading ? 'ui-btn-disabled' : '';
  const loadingClass = loading ? 'ui-btn-loading' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="ui-btn-spinner" aria-hidden="true" />}
      {!loading && iconLeft && <span className="ui-btn-icon-left">{iconLeft}</span>}
      <span className="ui-btn-content">{children}</span>
      {!loading && iconRight && <span className="ui-btn-icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button;
