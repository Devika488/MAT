import React, { useState, useEffect } from 'react';
import { DatePicker } from '../../components/common/DatePicker/DatePicker';
import { Input } from '../../components/common/Input/Input';
import { useToast } from '../../components/common/Toast/ToastContext';
import { RoomAvailability } from '../../types';
import './ReserveBlock.css';

interface ReserveBlockProps {
  retreatId: number;
}

const ReserveBlock: React.FC<ReserveBlockProps> = ({ retreatId }) => {
  const { showToast } = useToast();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  
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

    if (!selectedRoom) newErrors.sanctuary = 'Please select your sanctuary.';

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
      setLoadingRooms(true);
      try {
        let url = `/api/retreats/${retreatId}/availability`;
        
        if (checkIn && checkOut && checkIn < checkOut) {
          const ciStr = checkIn.toLocaleDateString('en-CA');
          const coStr = checkOut.toLocaleDateString('en-CA');
          url += `?check_in=${ciStr}&check_out=${coStr}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch availability');
        
        if (active) {
          setRooms(data.rooms);
          // Only reset selection if the selected room is no longer available
          if (selectedRoom) {
            const currentRoom = data.rooms.find((r: RoomAvailability) => r.room_type === selectedRoom);
            if (!currentRoom || !currentRoom.available) {
              setSelectedRoom('');
            }
          }
        }
      } catch (err: any) {
        if (active) showToast(err.message, 'error');
      } finally {
        if (active) setLoadingRooms(false);
      }
    };

    // Always fetch once to populate rooms. Re-fetch when dates change.
    fetchAvailability();

    return () => {
      active = false;
    };
  }, [retreatId, checkIn, checkOut, showToast]);

  const handleBooking = async () => {
    // Mark everything as touched on submit to show all errors
    setTouched({
      checkIn: true,
      checkOut: true,
      sanctuary: true,
      name: true,
      email: true
    });

    if (!validateForm()) {
      showToast('Please correct the errors in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomData = rooms.find((r) => r.room_type === selectedRoom);
      
      const payload = {
        traveller_name: name,
        email,
        retreat_id: roomData ? Number(roomData.id) : Number(retreatId),
        room_type: selectedRoom,
        check_in: checkIn!.toLocaleDateString('en-CA'),
        check_out: checkOut!.toLocaleDateString('en-CA')
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Conflict generating booking');
      }

      showToast('Booking successfully scheduled! We will contact you soon.', 'success');
      
      // Auto reset the form
      setCheckIn(null);
      setCheckOut(null);
      setName('');
      setEmail('');
      setSelectedRoom('');

    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
                  placeholder="Check In"
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
                  placeholder="Check Out"
                />
              </div>
              {touched.checkOut && errors.checkOut && <span className="field-error-message">{errors.checkOut}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="reserve-step">
        <div className="step-badge">2</div>
        <div className="step-content">
          <h3>Choose Your Sanctuary</h3>
          {loadingRooms && rooms.length === 0 ? (
            <p className="step-hint">Searching available sanctuaries...</p>
          ) : rooms.length === 0 ? (
            <p className="step-hint">No configured sanctuary tier available...</p>
          ) : (
            <>
              <div className="rooms-grid">
                {rooms.map((rm) => (
                  <div 
                    key={rm.id}
                    className={`room-card ${rm.available === true && selectedRoom === rm.room_type ? 'selected' : ''} ${rm.available === false ? 'booked' : ''} ${touched.sanctuary && errors.sanctuary ? 'error' : ''}`}
                    onClick={() => {
                      if (rm.available === true) {
                        setSelectedRoom(rm.room_type);
                        setTouched(prev => ({ ...prev, sanctuary: true }));
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.sanctuary;
                          return next;
                        });
                      }
                    }}
                  >
                    <h4>{rm.room_type}</h4>
                    <span className={`availability-text ${rm.available === false ? 'red' : ''}`}>
                      {rm.available === true ? 'Available' : rm.available === false ? 'Fully Booked' : 'Select Dates'}
                    </span>
                    <div className="room-price">
                      {rm.available !== false ? `$${Number(rm.price_usd).toLocaleString()}` : 'Sold Out'}
                    </div>
                  </div>
                ))}
              </div>
              {touched.sanctuary && errors.sanctuary && <span className="field-error-message">{errors.sanctuary}</span>}
            </>
          )}
        </div>
      </div>

      <div className="reserve-step">
        <div className="step-badge">3</div>
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
        <div className="secure-tag">Secure checkout with instant confirmation</div>
      </div>
    </div>
  );
};

export default ReserveBlock;
