/**
 * Point d'entrée public pour l'usage server-side des intégrations.
 *
 *   import { useCredentials } from '@/lib/integrations'
 *   const creds = await useCredentials('anthropic')
 *
 * Renvoie null si l'utilisateur n'a pas configuré la clé.
 */

export { getCredentials as useCredentials } from './store'
export { INTEGRATIONS, getIntegration } from './registry'
export type { IntegrationDefinition } from './registry'
