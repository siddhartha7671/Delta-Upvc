// Central API Configuration for easy network access across all devices
const IS_PRODUCTION = false; // Set to true if deploying to a server
const SERVER_IP = '192.168.1.93'; 

// Use the explicit IP for both local and network access to bypass proxy issues on mobile
export const API_BASE_URL = IS_PRODUCTION ? '/api' : `http://${SERVER_IP}:8080/api`;

console.log(`📡 Delta Portal: Backend Target is ${API_BASE_URL}`);
