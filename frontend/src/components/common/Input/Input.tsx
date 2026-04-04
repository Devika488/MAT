import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapperClassName?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  wrapperClassName = '', 
  className = '', 
  error,
  ...props 
}) => {
  return (
    <div className={`input-component-wrapper ${wrapperClassName}`}>
      {label && <label className="input-component-label">{label}</label>}
      <input 
        className={`input-component-field ${error ? 'error' : ''} ${className}`} 
        {...props} 
      />
      {error && <span className="input-component-error-message">{error}</span>}
    </div>
  );
};
