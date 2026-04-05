import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import { Dropdown } from '../../components/common/Dropdown';
import { getBookings, cancelBookingForGuest } from '../../services/bookingService';
import { FetchedBooking } from '../../types/booking';
import { useToast } from '../../components/common/Toast/ToastContext';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const [bookings, setBookings] = useState<FetchedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRetreat, setFilterRetreat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [showToast]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBookingForGuest(id);
      showToast('Booking cancelled successfully', 'success');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  // Extract unique retreat names for the dropdown
  const uniqueRetreats = Array.from(new Set(bookings.map(b => b.retreat_name))).filter(Boolean);
  const retreatOptions = [
    { label: 'All Retreats', value: '' },
    ...uniqueRetreats.map(name => ({ label: name, value: name }))
  ];

  // Filtering
  const filteredBookings = filterRetreat 
    ? bookings.filter(b => b.retreat_name === filterRetreat)
    : bookings;

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="admin-page">
      <Header />
      <main className="admin-container">
        <div className="admin-header">
          <div className="admin-title-section">
            <h1>All Bookings</h1>
            <p>
              Manage the sanctuary guest list. Oversee arrivals, departures, and seasonal retreat scheduling from a centralized vantage point.
            </p>
          </div>
          <div className="admin-filters">
            <Dropdown 
              id="admin-retreat-filter"
              value={filterRetreat}
              onChange={(val) => {
                setFilterRetreat(val);
                setCurrentPage(1);
              }}
              options={retreatOptions}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Traveller Name</th>
                <th>Email</th>
                <th>Retreat Name</th>
                <th>Room Type</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No bookings found.</td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#BK-{booking.id.toString().padStart(4, '0')}</td>
                    <td className="traveller-info">
                      <strong>{booking.traveller_name}</strong>
                    </td>
                    <td>{booking.email}</td>
                    <td className="retreat-name">{booking.retreat_name}</td>
                    <td>{booking.room_type}</td>
                    <td>{formatDate(booking.check_in)}</td>
                    <td>{formatDate(booking.check_out)}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'confirmed' && (
                        <button 
                          className="cancel-action-btn"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {!loading && filteredBookings.length > 0 && (
            <div className="pagination-footer">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
              </span>
              <div className="pagination-controls">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
