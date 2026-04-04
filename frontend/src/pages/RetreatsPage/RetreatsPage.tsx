import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import RetreatCard from '../../components/RetreatCard/RetreatCard';
import Pagination from '../../components/Pagination/Pagination';
import './RetreatsPage.css';

import { Retreat } from '../../types';
import { getRetreats } from '../../services/retreatService';
import { Dropdown } from '../../components/common/Dropdown';

const RetreatsPage: React.FC = () => {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingCountry, setPendingCountry] = useState<string>('');
  const [pendingType, setPendingType] = useState<string>('');

  const [activeCountry, setActiveCountry] = useState<string>('');
  const [activeType, setActiveType] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    let active = true;

    const fetchRetreats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRetreats({
          country: activeCountry || undefined,
          type: activeType || undefined
        });
        if (active) {
          setRetreats(data);
          setCurrentPage(1); // Reset to first page on filter change
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch retreats');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchRetreats();

    return () => {
      active = false;
    };
  }, [activeCountry, activeType]);
  
  // Logic for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = retreats.slice(startIndex, endIndex);
  const totalPages = Math.ceil(retreats.length / itemsPerPage);

  const handlePageChange = (pageNo: number) => {
    setCurrentPage(pageNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasChanges = pendingCountry !== activeCountry || pendingType !== activeType;
  const hasActiveFilters = activeCountry !== '' || activeType !== '';

  const handleApply = () => {
    setActiveCountry(pendingCountry);
    setActiveType(pendingType);
  };

  const handleClear = () => {
    setPendingCountry('');
    setPendingType('');
    setActiveCountry('');
    setActiveType('');
  };

  return (
    <div className="retreats-page">
      <Header />
      
      <main className="container">
        <section className="retreats-hero">
          <div className="hero-text">
            <h1 className="hero-title">Ayurveda Retreats</h1>
            <p className="hero-description">
              Discover sanctuaries of healing designed to restore your natural rhythm. From the lush hills of Kerala to the serene shores of Sri Lanka.
            </p>
          </div>
          
          <div className="hero-filters-bar">
            <div className="filter-group">
              <Dropdown 
                id="country"
                label="COUNTRY"
                value={pendingCountry}
                onChange={(val: string) => setPendingCountry(val)}
                options={[
                  { label: 'All Countries', value: '' },
                  { label: 'India', value: 'India' },
                  { label: 'Sri Lanka', value: 'Sri Lanka' }
                ]}
              />
            </div>
            <div className="filter-group">
              <Dropdown 
                id="type"
                label="TREATMENT TYPE"
                value={pendingType}
                onChange={(val: string) => setPendingType(val)}
                options={[
                  { label: 'All Types', value: '' },
                  { label: 'Panchakarma', value: 'Panchakarma' },
                  { label: 'Detox', value: 'Detox' },
                  { label: 'Rasayana', value: 'Rasayana' },
                  { label: 'Rejuvenation', value: 'Rejuvenation' }
                ]}
              />
            </div>
            
            <button 
              className={`apply-filters-btn ${!hasChanges ? 'disabled' : ''}`}
              onClick={handleApply}
              disabled={!hasChanges}
            >
              APPLY FILTERS
            </button>
            
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={handleClear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                </svg>
                <span>CLEAR</span>
              </button>
            )}
          </div>
        </section>

        <section className="retreats-grid">
          {loading && <div className="loading-state">Loading retreats...</div>}
          {!loading && error && <div className="error-state">{error}</div>}
          {!loading && !error && currentItems.length === 0 && (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3>No results found</h3>
              <p>We couldn't find any retreats matching your selected country and treatment type.</p>
              <button className="btn-secondary" onClick={handleClear}>Clear Filters</button>
            </div>
          )}
          {!loading && !error && currentItems.map((retreat) => (
            <RetreatCard 
              key={retreat.id} 
              id={retreat.id}
              image={retreat.image_url}
              tag={retreat.ayurveda_type}
              title={retreat.name}
              price={Number(retreat.price_usd)}
              durationDays={retreat.duration_days}
              location={retreat.location}
              roomType={retreat.room_type}
            />
          ))}
        </section>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages > 0 ? totalPages : 1}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
};

export default RetreatsPage;
