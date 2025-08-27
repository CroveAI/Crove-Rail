// Re-export the main API client from Chatwoot
// This allows us to use the same axios instance with all the auth headers
export { default as API } from '../../../api/client';