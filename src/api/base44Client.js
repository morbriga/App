import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6804edf8c6cb1be063f390b6", 
  requiresAuth: true // Ensure authentication is required for all operations
});
