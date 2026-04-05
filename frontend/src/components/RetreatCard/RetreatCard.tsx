import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RetreatCard.css';

export interface RetreatCardProps {
  id: string | number;
  image: string;
  tag: string;
  title: string;
  price: number;
  durationDays: number;
  location: string;
}

export const RetreatCard: React.FC<RetreatCardProps> = ({
  id,
  image,
  tag,
  title,
  price,
  durationDays,
  location,
}) => {
  const navigate = useNavigate();

  return (
    <div className="retreat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/retreats/${id}`)}>
      <div className="retreat-image-container">
        <img src={image} alt={title} className="retreat-image" />
        {tag && <span className="retreat-tag">{tag}</span>}
      </div>
      <div className="retreat-info">
        <div className="retreat-header">
          <h3 className="retreat-title">{title}</h3>
          <div className="retreat-price-info">
            <span className="retreat-price">${price.toLocaleString()}</span>
            <span className="retreat-duration">{durationDays} DAYS</span>
          </div>
        </div>
        <div className="retreat-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {location}
        </div>
        <button className="btn-secondary retreat-book-btn">View & Book</button>
      </div>
    </div>
  );
};

export default React.memo(RetreatCard);
