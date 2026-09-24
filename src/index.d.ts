import type { Buffer } from 'node:buffer'

export type Algorithm = 'sha1' | 'sha256' | 'sha512' | 'SHA1' | 'SHA256' | 'SHA512'
export interface HOTPOptions {
  digits?: 6 | 7 | 8
  algorithm?: Algorithm
}
export interface TOTPOptions extends HOTPOptions {
  /** Nonnegative safe integer Unix timestamp in milliseconds. */
  epoch?: number
  /** Positive safe integer time step in seconds. Default: 30. */
  step?: number
}
export interface TOTPVerifyOptions extends TOTPOptions {
  /** Integer from 0 to 10, checked before and after the current step. */
  window?: number
}
export interface ProvisioningOptions extends HOTPOptions {
  label: string
  secret: string
  issuer?: string
}
export type OTPAuthOptions = ProvisioningOptions & (
  | { type?: 'totp', period?: number }
  | { type: 'hotp', counter: number | bigint }
)
/** Generate 16–1024 random bytes and return their Base32 encoding. Default: 32 bytes. */
export function generateSecret(length?: number): string
export function otpauthURL(options: OTPAuthOptions): string
export const hotp: {
  generate(secret: string, counter: number | bigint, opts?: HOTPOptions): string
  verify(secret: string, counter: number | bigint, token: unknown, opts?: HOTPOptions): boolean
}
export const totp: {
  generate(secret: string, opts?: TOTPOptions): string
  verify(secret: string, token: unknown, opts?: TOTPVerifyOptions): boolean
}
export const base32: {
  encode(input: Uint8Array, padding?: boolean): string
  decode(input: string): Buffer
}
