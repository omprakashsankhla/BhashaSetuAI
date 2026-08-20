import React from 'react';
import './Input.css';

const Input = React.forwardRef(({
  id,
  label,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  const isInvalid = !!error;
  const describedBy = error ? `${id}-error` : (helperText ? `${id}-helper` : undefined);

  return (
    <div className={`ui-input-wrapper ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="ui-input-label">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        id={id}
        className={`ui-input ${isInvalid ? 'ui-input-invalid' : ''}`}
        aria-invalid={isInvalid}
        aria-describedby={describedBy}
        {...props}
      />

      {error && (
        <span id={`${id}-error`} className="ui-input-error-msg" role="alert">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span id={`${id}-helper`} className="ui-input-helper-msg">
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
