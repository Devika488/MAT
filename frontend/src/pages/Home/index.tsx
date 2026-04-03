import React, { useEffect, useState } from 'react';
import { fetchHealth, HealthResponse } from '../../services/healthService';

const Home: React.FC = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getHealthData = async () => {
      try {
        const json = await fetchHealth();
        setData(json);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error occurred');
        }
      }
    };

    getHealthData();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>System Status</h1>
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : !data ? (
          <p>Loading...</p>
        ) : (
          <>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Database:</strong> {data.db}</p>
            <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
