import React from 'react';
import ReactDatePicker, { DatePickerProps as ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

export interface DatePickerProps extends Omit<ReactDatePickerProps, 'onChange'> {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  selected, 
  onChange, 
  placeholder, 
  className = '', 
  ...props 
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="custom-datepicker-wrapper">
      {/* @ts-ignore: React-datepicker generic union mismatch on wrapper */}
      <ReactDatePicker
        className={`react-custom-datepicker ${className}`}
        selected={selected}
        onChange={onChange as any}
        placeholderText={placeholder}
        dateFormat="MM/dd/yyyy"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="custom-datepicker-header">
            {/* Diamond Left Arrow */}
            <button 
              type="button"
              className="nav-btn prev"
              onClick={decreaseMonth} 
              disabled={prevMonthButtonDisabled}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="header-center">
              <span className="current-date-text">
                {months[date.getMonth()]} {date.getFullYear()}
              </span>
              
              <div className="header-dropdowns">
                <select
                  value={months[date.getMonth()]}
                  onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                >
                  {months.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(Number(value))}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diamond Right Arrow */}
            <button 
              type="button"
              className="nav-btn next"
              onClick={increaseMonth} 
              disabled={nextMonthButtonDisabled}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
        {...props}
      />
    </div>
  );
};
