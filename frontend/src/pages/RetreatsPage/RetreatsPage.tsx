import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import RetreatCard from '../../components/RetreatCard/RetreatCard';
import Pagination from '../../components/Pagination/Pagination';
import RecommendationCard from '../../components/RecommendationCard/RecommendationCard';
import { useToast } from '../../components/common/Toast/ToastContext';
import './RetreatsPage.css';

import { Retreat } from '../../types';
import { getRetreats, getRecommendations } from '../../services/retreatService';
import { Dropdown } from '../../components/common/Dropdown';
import { Input } from '../../components/common/Input/Input';

const RetreatsPage: React.FC = () => {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [pendingCountry, setPendingCountry] = useState<string>('');
  const [pendingType, setPendingType] = useState<string>('');

  const [activeCountry, setActiveCountry] = useState<string>('');
  const [activeType, setActiveType] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [searchGoal, setSearchGoal] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
          showToast(err.message || 'Failed to fetch retreats', 'error');
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
    setRecommendations(null);
    setSearchGoal('');
  };

  const handleSearch = async () => {
    if (!searchGoal.trim()) return;
    
    // Clear filters and reset pagination when initiating a search
    setPendingCountry('');
    setPendingType('');
    setActiveCountry('');
    setActiveType('');
    setCurrentPage(1);
    
    setIsSearching(true);
    setRecommendations(null);
    try {
      const data = await getRecommendations(searchGoal);
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to get recommendations', 'error');
    } finally {
      setIsSearching(false);
    }
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
            {/* Recommendation Search */}
            <div className="search-group">
              <Input 
                type="text" 
                placeholder="E.g., I have stress and back pain..." 
                value={searchGoal}
                onChange={(e) => setSearchGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
                wrapperClassName="search-input-wrapper"
              />
              <button 
                className="btn-primary search-btn" 
                onClick={handleSearch}
                disabled={isSearching || !searchGoal.trim()}
              >
                {isSearching ? 'Thinking...' : 'Search'}
              </button>
            </div>
            
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
                disabled={!!recommendations || isSearching}
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
                disabled={!!recommendations || isSearching}
              />
            </div>
            
            <button 
              className={`apply-filters-btn ${!hasChanges || !!recommendations || isSearching ? 'disabled' : ''}`}
              onClick={handleApply}
              disabled={!hasChanges || !!recommendations || isSearching}
            >
              APPLY FILTERS
            </button>
            
            {hasActiveFilters && !recommendations && (
              <button className="clear-filters-btn" onClick={handleClear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                </svg>
                <span>CLEAR</span>
              </button>
            )}
            
            {recommendations && (
              <button className="clear-filters-btn" onClick={handleClear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                </svg>
                <span>BACK TO ALL</span>
              </button>
            )}
          </div>
        </section>

        <section className="retreats-grid">
          {loading && !recommendations && <div className="loading-state">Loading retreats...</div>}
          {isSearching && <div className="loading-state">Finding best recommendations...</div>}
          {!loading && error && !recommendations && <div className="error-state">{error}</div>}
          
          {recommendations !== null && !isSearching && (
            <>
              {recommendations.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <h3>No recommendations found</h3>
                  <p>Try rephrasing your goal.</p>
                  <button className="btn-secondary" onClick={handleClear}>Back to full list</button>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <RecommendationCard 
                    key={rec.retreat_id}
                    id={rec.retreat_id}
                    name={rec.name}
                    location={rec.location}
                    ayurveda_type={rec.ayurveda_type}
                    price_usd={rec.price_usd}
                    image_url={rec.image_url}
                    reason={rec.reason}
                  />
                ))
              )}
            </>
          )}

          {!loading && !error && currentItems.length === 0 && recommendations === null && !isSearching && (
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
          {!loading && !error && recommendations === null && !isSearching && currentItems.map((retreat) => (
            <RetreatCard 
              key={retreat.id} 
              id={retreat.id}
              image={retreat.image_url}
              tag={retreat.ayurveda_type}
              title={retreat.name}
              price={Number(retreat.price_usd)}
              durationDays={retreat.duration_days}
              location={retreat.location}
            />
          ))}
        </section>

        {recommendations === null && !isSearching && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages > 0 ? totalPages : 1}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
};

export default RetreatsPage;
