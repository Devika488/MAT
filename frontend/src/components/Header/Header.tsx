import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">MyAyurvedaTrip</Link>
        </div>
        <nav className="header-nav">
          <Link to="/" className="nav-link active">Retreats</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </nav>
        {/* User icon removed as per requirement */}
        <div className="header-actions">
           {/* Space reserved if needed in future */}
        </div>
      </div>
    </header>
  );
};

export default Header;
