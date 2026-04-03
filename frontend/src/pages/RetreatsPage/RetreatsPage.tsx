import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import RetreatCard from '../../components/RetreatCard/RetreatCard';
import Pagination from '../../components/Pagination/Pagination';
import './RetreatsPage.css';

// Mock data based on the provided image and realistic content
const RetreatsData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tag: 'PANCHAKARMA',
    title: 'Vana Malsi Estate',
    price: 3450,
    durationDays: 14,
    location: 'Dehradun, India',
    roomType: 'Forest Suite'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tag: 'DETOX',
    title: 'Santani Wellness',
    price: 2100,
    durationDays: 7,
    location: 'Kandy, Sri Lanka',
    roomType: 'Mountain Chalet'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tag: 'RASAYANA',
    title: 'Somatheeram Village',
    price: 1850,
    durationDays: 10,
    location: 'Kerala, India',
    roomType: 'Heritage Cottage'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tag: 'REJUVENATION',
    title: 'Ananda in the Himalayas',
    price: 4200,
    durationDays: 21,
    location: 'Rishikesh, India',
    roomType: 'Garden Suite'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tag: 'PANCHAKARMA',
    title: 'Sen Wellness Sanctuary',
    price: 2600,
    durationDays: 12,
    location: 'Tangalle, Sri Lanka',
    roomType: 'Eco Cabana'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    tag: 'DETOX',
    title: 'Carnoustie Ayurveda',
    price: 2950,
    durationDays: 14,
    location: 'Mararikulam, India',
    roomType: 'Pool Villa'
  }
];

const RetreatsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Logic for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = RetreatsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(RetreatsData.length / itemsPerPage);

  const handlePageChange = (pageNo: number) => {
    setCurrentPage(pageNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          
          <div className="hero-filters">
            <div className="filter-group">
              <label htmlFor="country">COUNTRY</label>
              <select id="country" className="filter-select">
                <option>All Countries</option>
                <option>India</option>
                <option>Sri Lanka</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="type">AYURVEDA TYPE</label>
              <select id="type" className="filter-select">
                <option>All Types</option>
                <option>Panchakarma</option>
                <option>Detox</option>
                <option>Rasayana</option>
                <option>Rejuvenation</option>
              </select>
            </div>
          </div>
        </section>

        <section className="retreats-grid">
          {currentItems.map((retreat) => (
            <RetreatCard key={retreat.id} {...retreat} />
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
