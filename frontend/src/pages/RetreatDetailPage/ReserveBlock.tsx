import React, { useState, useEffect } from 'react';
import { DatePicker } from '../../components/common/DatePicker/DatePicker';
import { Input } from '../../components/common/Input/Input';
import { useToast } from '../../components/common/Toast/ToastContext';
import { AvailabilityResponse, BookingPayload } from '../../types';
import { getAvailability, createBooking } from '../../services';
import './ReserveBlock.css';

interface ReserveBlockProps {
  retreatId: number;
}

const ReserveBlock: React.FC<ReserveBlockProps> = ({ retreatId }) => {
  const { showToast } = useToast();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!checkIn) newErrors.checkIn = 'Please select a check-in date.';
    if (!checkOut) newErrors.checkOut = 'Please select a check-out date.';
    if (checkIn && checkOut && checkOut <= checkIn) {
      newErrors.checkOut = 'Check-out must be at least one day after check-in.';
    }

    if (!name.trim()) newErrors.name = 'Full name is required.';
    else if (name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters.';

    if (!email.trim()) newErrors.email = 'Email address is required.';
    else if (!validateEmail(email.trim())) newErrors.email = 'Please enter a valid email address.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    // Trigger localized validation on blur
    const newErrors = { ...errors };
    if (field === 'name') {
      if (!name.trim()) newErrors.name = 'Full name is required.';
      else if (name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters.';
      else delete newErrors.name;
    }
    if (field === 'email') {
      if (!email.trim()) newErrors.email = 'Email address is required.';
      else if (!validateEmail(email.trim())) newErrors.email = 'Please enter a valid email address.';
      else delete newErrors.email;
    }
    setErrors(newErrors);
  };

  useEffect(() => {
    let active = true;

    const fetchAvailability = async () => {
      // Prevent unnecessary API calls if both dates aren't selected yet
      if (!checkIn || !checkOut) {
        if (availability) setAvailability(null);
        return;
      }

      setLoadingAvail(true);
      try {
        const data = await getAvailability(retreatId, checkIn, checkOut);
        
        if (active) {
          setAvailability(data);
        }
      } catch (err: any) {
        if (active) showToast(err.message, 'error');
      } finally {
        if (active) setLoadingAvail(false);
      }
    };

    fetchAvailability();

    return () => {
      active = false;
    };
  }, [retreatId, checkIn, checkOut, showToast]);

  const handleBooking = async () => {
    setTouched({
      checkIn: true,
      checkOut: true,
      name: true,
      email: true
    });

    if (!validateForm()) {
      showToast('Please correct the errors in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BookingPayload = {
        traveller_name: name,
        email,
        retreat_id: Number(retreatId),
        check_in: checkIn!.toLocaleDateString('en-CA'),
        check_out: checkOut!.toLocaleDateString('en-CA')
      };

      await createBooking(payload);

      showToast('Booking successfully scheduled! We will contact you soon.', 'success');
      
      setCheckIn(null);
      setCheckOut(null);
      setName('');
      setEmail('');
      setAvailability(null);

    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBanner = () => {
    if (loadingAvail) {
      return (
        <div className="availability-banner">
          <div className="banner-content">
             <span className="banner-text-initial">Checking availability...</span>
          </div>
        </div>
      );
    }

    if (!checkIn || !checkOut || (availability?.available_slots == null)) {
      return (
        <div className="availability-banner initial">
          <div className="banner-icon calendar-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div className="banner-content">
            <span className="banner-text-initial">Select your journey dates to check sanctuary availability. Retreats typically begin on Mondays to align with our lunar detox cycles.</span>
          </div>
        </div>
      );
    }

    if (availability.available_slots === 0 || availability.available === false) {
      return (
        <div className="availability-banner unavailable">
          <div className="banner-icon unavailable-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="10" y1="14" x2="14" y2="18"></line><line x1="14" y1="14" x2="10" y2="18"></line></svg>
          </div>
          <div className="banner-content dual-row">
            <div className="banner-main-col">
              <span className="banner-primary-text italic-grey">Sanctuary is currently at full capacity for your selected dates.</span>
              <span className="banner-secondary-text">{availability.booked} OF {availability.capacity} SPACES CURRENTLY RESERVED</span>
            </div>
            <div className="banner-cap-col">
              Sanctuary Capacity: {availability.capacity}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="availability-banner available">
        <div className="banner-icon available-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div className="banner-content dual-row">
          <div className="banner-main-col">
            <span className="banner-primary-text italic-green">{availability.available_slots} spaces remaining for your journey</span>
            <span className="banner-secondary-text">{availability.booked} CURRENTLY BOOKED FOR YOUR DATES</span>
          </div>
          <div className="banner-cap-col">
            Sanctuary Capacity: {availability.capacity}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reserve-wrapper">
      <div className="reserve-header">
        <h2>Reserve <span className="underline">Your Space</span></h2>
      </div>

      <div className="reserve-step">
        <div className="step-badge">1</div>
        <div className="step-content">
          <h3>Select Your Journey Dates</h3>
          <div className="dates-row">
            <div className="date-input-group">
              <label>CHECK-IN</label>
              <div className={`date-input-wrapper ${touched.checkIn && errors.checkIn ? 'error' : ''}`}>
                <DatePicker 
                  selected={checkIn}
                  minDate={new Date()}
                  onChange={(date: Date | null) => {
                    setCheckIn(date);
                    setTouched(prev => ({ ...prev, checkIn: true }));
                    if (checkOut && date && date >= checkOut) {
                      setCheckOut(null);
                    }
                    if (date) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.checkIn;
                        return next;
                      });
                    }
                  }}
                  placeholder="mm/dd/yyyy"
                />
              </div>
              {touched.checkIn && errors.checkIn && <span className="field-error-message">{errors.checkIn}</span>}
            </div>
            <div className="date-input-group">
              <label>CHECK-OUT</label>
              <div className={`date-input-wrapper ${touched.checkOut && errors.checkOut ? 'error' : ''}`}>
                <DatePicker
                  selected={checkOut}
                  minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date(Date.now() + 86400000)}
                  onChange={(date: Date | null) => {
                    setCheckOut(date);
                    setTouched(prev => ({ ...prev, checkOut: true }));
                    if (date) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.checkOut;
                        return next;
                      });
                    }
                  }}
                  placeholder="mm/dd/yyyy"
                />
              </div>
              {touched.checkOut && errors.checkOut && <span className="field-error-message">{errors.checkOut}</span>}
            </div>
          </div>
        </div>
      </div>

      {renderBanner()}

      <div className="reserve-step" style={{ marginTop: '3rem' }}>
        <div className="step-badge">2</div>
        <div className="step-content">
          <h3>Guest Information</h3>
          <div className="guest-row">
            <Input 
              label="FULL NAME"
              type="text" 
              placeholder="Enter Name" 
              value={name} 
              error={touched.name ? errors.name : ''}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) handleBlur('name');
              }} 
              onBlur={() => handleBlur('name')}
            />
            <Input 
              label="EMAIL ADDRESS"
              type="email" 
              placeholder="Enter Email Address" 
              value={email} 
              error={touched.email ? errors.email : ''}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) handleBlur('email');
              }} 
              onBlur={() => handleBlur('email')}
            />
          </div>
        </div>
      </div>

      {(availability?.available_slots == null || availability?.available_slots > 0) && (
        <div className="reserve-footer">
          <button 
            className={`confirm-btn ${isSubmitting ? 'submitting' : ''}`}
            onClick={handleBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="btn-loader-wrapper">
                <div className="btn-spinner"></div>
                <span>Processing...</span>
              </div>
            ) : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReserveBlock;
