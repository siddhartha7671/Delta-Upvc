// Central API Configuration for high-fidelity global access
// When deploying to Vercel, the production URL is automatically prioritized.

const LOCAL_IP = '192.168.1.93'; // Your developer PC's local network IP

// Detection logic for Vercel vs Local Development
const getApiUrl = () => {
    // 1. Force Production URL if deployed or explicitly requested
    const PRODUCTION_URL = "https://delta-upvc-backend.onrender.com/api";
    
    // 2. Check for Environment Variable (Set in Host Dashboard)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // 3. Check if visiting a public domain
    const isPublicDomain = !window.location.hostname.includes('localhost') && 
                           !window.location.hostname.includes('127.0.0.1') &&
                           !window.location.hostname.match(/^\d/);
                           
    if (isPublicDomain) {
        return PRODUCTION_URL; 
    }

    // 4. Default to Local Development (Local Network IP for mobile testing)
    // Switch to PRODUCTION_URL here if you want to test local frontend with live backend
    return '/api';
};

export const API_BASE_URL = getApiUrl();

console.log(`📡 Delta Portal Connectivity: Targeted Backend is [${API_BASE_URL}]`);
