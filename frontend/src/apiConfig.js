// Central API Configuration for easy network access
const IS_PRODUCTION = false; // Set to true if deploying to a server
const SERVER_IP = '192.168.1.93'; 

// Use the local or network IP for backend access
export const API_BASE_URL = IS_PRODUCTION ? '/api' : `http://${SERVER_IP}:8080/api`;

console.log(`📡 Delta Portal: Backend Target is ${API_BASE_URL}`);
