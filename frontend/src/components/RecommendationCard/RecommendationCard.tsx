import React from 'react';
import './RecommendationCard.css';

interface RecommendationCardProps {
  id: number;
  name: string;
  location: string;
  ayurveda_type: string;
  price_usd: number;
  reason: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  name,
  location,
  ayurveda_type,
  price_usd,
  reason
}) => {
  return (
    <div className="recommendation-card">
      <div className="recommendation-content">
        <div className="recommendation-header">
          <span className="recommendation-tag">{ayurveda_type}</span>
          <span className="recommendation-price">${price_usd}</span>
        </div>
        <h3 className="recommendation-title">{name}</h3>
        <p className="recommendation-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {location}
        </p>
        <div className="recommendation-reason">
          <strong>Why this suits you:</strong>
          <p>{reason}</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
