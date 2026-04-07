// Central API Configuration for high-fidelity global access
// When deploying to Vercel, the production URL is automatically prioritized.

const LOCAL_IP = '192.168.1.93'; // Your developer PC's local network IP

// Detection logic for Vercel vs Local Development
const getApiUrl = () => {
    // 1. Check for Environment Variable (Set this in Vercel Dashboard -> Settings -> Environment Variables)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // 2. Check if the browser is currently visiting a Vercel/Production domain
    const isPublicDomain = !window.location.hostname.includes('localhost') && 
                           !window.location.hostname.includes('127.0.0.1') &&
                           !window.location.hostname.match(/^\d/); // Check if not an IP
                           
    if (isPublicDomain) {
        // Fallback for public domains: assumes backend is on the same host or a known subdomain
        // Replace with your real Render/Railway URL for absolute stability!
        return "https://delta-upvc-backend.onrender.com/api"; 
    }

    // 3. Default to Local Development
    return `http://${LOCAL_IP}:8080/api`;
};

export const API_BASE_URL = getApiUrl();

console.log(`📡 Delta Portal Connectivity: Targeted Backend is [${API_BASE_URL}]`);
