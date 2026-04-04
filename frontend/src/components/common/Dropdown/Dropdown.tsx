import React, { useState, useRef, useEffect } from 'react';
import { Option } from '../../../types';
import './Dropdown.css';

interface DropdownProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder,
  id,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : (placeholder || 'Select...');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <div 
        className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        id={id}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="select-inner">
          {label && <span className="dropdown-label-inner">{label}</span>}
          <span className={`selected-value ${!selectedOption && placeholder ? 'placeholder' : ''}`}>
            {displayValue}
          </span>
        </div>
        <div className={`select-arrow ${isOpen ? 'open' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <ul className="dropdown-list">
          {placeholder && (
            <li 
              className={`dropdown-item ${value === '' ? 'selected' : ''}`}
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </li>
          )}
          {options.filter(opt => opt.value !== '').length > 0 ? (
            options.filter(opt => opt.value !== '').map((opt) => (
              <li 
                key={opt.value} 
                className={`dropdown-item ${value === opt.value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="dropdown-item disabled-item" style={{ fontStyle: 'italic', color: '#999', cursor: 'default' }}>
              No options available
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
