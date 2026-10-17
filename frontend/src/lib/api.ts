/**
 * Centralized API base URL.
 * Set NEXT_PUBLIC_API_URL in .env.local for local dev, or in your hosting
 * platform's environment settings for production.
 * 
 * Example production value: https://api.meritmaster.pk
 */
export const API_BASE: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
