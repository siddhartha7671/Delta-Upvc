import { useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';

const EmployeeTracker = ({ username }) => {
  useEffect(() => {
    // Only track employees, not the CEO
    if (!username || username === 'ceo_delta') return;

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    const success = (pos) => {
      const { latitude, longitude } = pos.coords;
      // Update both current location and personal log
      fetch(`${API_BASE_URL}/admin/track_location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, lat: latitude, lng: longitude })
      }).catch(err => console.error("Update Error:", err));
    };

    const error = (err) => {
      console.warn(`Location Error (${err.code}): ${err.message}`);
    };

    // watchPosition stays active in the background if the app is installed/active
    const watchId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [username]);

  return null;
};

export default EmployeeTracker;
