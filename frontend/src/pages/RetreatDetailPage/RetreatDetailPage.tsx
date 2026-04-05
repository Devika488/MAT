import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { Retreat } from '../../types';
import { useToast } from '../../components/common/Toast/ToastContext';
import { getRetreatById } from '../../services';
import ReserveBlock from './ReserveBlock';
import './RetreatDetailPage.css';

const RetreatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    const fetchRetreat = async () => {
      try {
        if (!id) return;
        const data = await getRetreatById(id);
        if (active) {
          setRetreat(data);
        }
      } catch (error: any) {
        if (active) {
          showToast(error.message || 'Failed to fetch retreat details.', 'error');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRetreat();

    return () => {
      active = false;
    };
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="detail-page">
        <Header />
        <main className="container loader-container">
          <div className="loading-state">Loading sanctuary details...</div>
        </main>
      </div>
    );
  }

  if (!retreat) {
    return (
      <div className="detail-page">
        <Header />
        <main className="container loader-container">
          <div className="error-state">
            <h2>Sanctuary Not Found</h2>
            <p>We couldn't locate the retreat you are looking for.</p>
            <Link to="/" className="btn-secondary">Return to Retreats</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Header />
      
      <main className="container detail-container">
        {/* Back Link */}
        <div className="breadcrumb">
          <Link to="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Retreats
          </Link>
        </div>

        {/* 2-Column Hero layout (1 image as requested) */}
        <section className="detail-hero">
          <div className="detail-hero-left">
            <img src={retreat.image_url} alt={retreat.name} className="detail-main-image" />
          </div>
          <div className="detail-hero-right">
            <span className="detail-super-title">HEALING SANCTUARY</span>
            <h1 className="detail-title">{retreat.name}</h1>
            <div className="detail-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {retreat.location}, {retreat.country}
            </div>

            <div className="detail-stats-grid">
              <div className="stat-block">
                <span className="stat-label">AYURVEDA TYPE</span>
                <span className="stat-value">{retreat.ayurveda_type}</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">DURATION</span>
                <span className="stat-value">{retreat.duration_days} Days / {retreat.duration_days - 1} Nights</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">PRICING</span>
                <span className="stat-value">from ${Number(retreat.price_usd).toLocaleString()}</span>
              </div>
            </div>

            <div className="detail-journey">
              <h3>The Journey</h3>
              <p>
                A profound exploration of self through traditional Vedic wisdom. This immersive experience combines customized herbal therapies, sattvic nutrition, and daily meditative practices designed to reset your biological clock and restore cellular harmony.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Component strictly separate */}
        <section className="reserve-section">
          <ReserveBlock retreatId={retreat.id} />
        </section>
      </main>
    </div>
  );
};

export default RetreatDetailPage;
