import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">MyAyurvedaTrip</Link>
        </div>
        <nav className="header-nav">
          <NavLink to="/" className="nav-link" end>Retreats</NavLink>
          <NavLink to="/admin" className="nav-link">Admin</NavLink>
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
