import PocketBase from 'pocketbase'

/**
 * Shared PocketBase SDK client. Uses a relative base URL so it works unmodified in both
 * dev (proxied by Vite, see vite.config.ts) and production (same origin as the built frontend).
 */
export const pb = new PocketBase()
