import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="layout-container">
      <header>
        <nav>
          {/* Navbar placeholder */}
          <h2>My Ayurveda Trip</h2>
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer>
        {/* Footer placeholder */}
        <p>&copy; {new Date().getFullYear()} My Ayurveda Trip</p>
      </footer>
    </div>
  );
};

export default MainLayout;
