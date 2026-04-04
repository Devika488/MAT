import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img src="/logo.png" alt="MTA Logo" className="logo-img" />
            <span>MyAyurvedaTrip</span>
          </Link>
        </div>
        <nav className="header-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `nav-link ${isActive || location.pathname.startsWith('/retreats') ? 'active' : ''}`
            }
            end
          >
            Retreats
          </NavLink>
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
