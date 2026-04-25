/**
 * Chiffrement symétrique AES-256-GCM pour stocker les credentials API
 * dans Supabase. La clé maître est lue depuis APP_ENCRYPTION_KEY (32 bytes hex).
 *
 * Utilisé UNIQUEMENT côté serveur (route handlers).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY
  if (!raw) throw new Error('APP_ENCRYPTION_KEY manquante (générer 32 bytes hex)')
  const key = Buffer.from(raw, 'hex')
  if (key.length !== 32) throw new Error('APP_ENCRYPTION_KEY doit faire 32 bytes (64 chars hex)')
  return key
}

/** Chiffre un objet JSON et renvoie un buffer prêt à stocker (iv|tag|ciphertext). */
export function encryptJson(payload: Record<string, unknown>): Buffer {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, getKey(), iv)
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext])
}

/** Déchiffre un buffer produit par encryptJson. */
export function decryptJson<T = Record<string, unknown>>(blob: Buffer): T {
  const iv = blob.subarray(0, 12)
  const tag = blob.subarray(12, 28)
  const ciphertext = blob.subarray(28)
  const decipher = createDecipheriv(ALGO, getKey(), iv)
  decipher.setAuthTag(tag)
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return JSON.parse(plain.toString('utf8')) as T
}

/** Renvoie une représentation masquée d'une valeur sensible (pour l'UI). */
export function maskValue(v: string | undefined | null): string {
  if (!v) return ''
  if (v.length <= 6) return '••••'
  return `${v.slice(0, 3)}••••${v.slice(-3)}`
}
