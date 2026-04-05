import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/Header/Header';
import { Dropdown } from '../../components/common/Dropdown';
import { getBookings, cancelBookingForGuest } from '../../services/bookingService';
import { getRetreats } from '../../services/retreatService';
import { FetchedBooking } from '../../types/booking';
import { useToast } from '../../components/common/Toast/ToastContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal/ConfirmationModal';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const [bookings, setBookings] = useState<FetchedBooking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterRetreatId, setFilterRetreatId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [retreats, setRetreats] = useState<{ id: number; name: string }[]>([]);
  
  const itemsPerPage = 10;
  const { showToast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBookings({
        retreat_id: filterRetreatId,
        status: statusFilter || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      setBookings(response.data);
      setTotalBookings(response.total);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterRetreatId, statusFilter, currentPage, showToast]);

  const fetchRetreats = useCallback(async () => {
    try {
      const data = await getRetreats();
      setRetreats(data);
    } catch (err: any) {
      console.error('Failed to fetch retreats for filter:', err);
    }
  }, []);

  useEffect(() => {
    fetchRetreats();
  }, [fetchRetreats]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelClick = (id: number) => {
    setSelectedBookingId(id);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;
    try {
      await cancelBookingForGuest(selectedBookingId);
      showToast('Booking cancelled successfully', 'success');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    } finally {
      setIsModalOpen(false);
      setSelectedBookingId(null);
    }
  };

  const retreatOptions = [
    { label: 'All Retreats', value: '' },
    ...Array.from(new Map(retreats.map(r => [r.name, r])).values()).map(r => ({ 
      label: r.name, 
      value: r.id.toString() 
    }))
  ];

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const totalPages = Math.ceil(totalBookings / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

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
            <div className="filter-group">
              <span className="filter-label">Retreat</span>
              <Dropdown 
                id="admin-retreat-filter"
                value={filterRetreatId ? filterRetreatId.toString() : ''}
                onChange={(val) => {
                  setFilterRetreatId(val ? parseInt(val) : undefined);
                  setCurrentPage(1);
                }}
                options={retreatOptions}
              />
            </div>
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <Dropdown 
                id="admin-status-filter"
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                options={statusOptions}
              />
            </div>
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
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No bookings found.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#BK-{booking.id.toString().padStart(4, '0')}</td>
                    <td className="traveller-info">
                      <strong>{booking.traveller_name}</strong>
                    </td>
                    <td>{booking.email}</td>
                    <td className="retreat-name">{booking.retreat_name}</td>
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
                          onClick={() => handleCancelClick(booking.id)}
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
          
          {!loading && totalBookings > 0 && (
            <div className="pagination-footer">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalBookings)} of {totalBookings} bookings
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
                  disabled={currentPage === totalPages || totalPages === 0}
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

      <ConfirmationModal 
        isOpen={isModalOpen}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action will notify the guest and cannot be undone."
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Booking"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AdminPage;
