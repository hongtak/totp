import { URLSearchParams } from 'node:url'
import base32 from './base32.js'
import * as validate from './validation.js'

function otpauthURL(options = {}) {
  validate.options(options)
  const type = options.type === undefined ? 'totp' : options.type
  if (!['totp', 'hotp'].includes(type)) {
    throw new Error(`Invalid type ${type}`)
  }
  const opts = {}
  if (type === 'hotp') {
    if (options.counter === undefined) {
      throw new Error('Counter is required for HOTP')
    }
    opts.counter = validate.counter(options.counter).toString()
  }
  if (typeof options.label !== 'string' || !options.label.trim()) {
    throw new Error('Label is required')
  }
  if (typeof options.secret !== 'string' || !options.secret) {
    throw new Error('Secret is required')
  }
  const secret = base32.decode(options.secret)
  if (secret.length === 0) {
    throw new Error('Secret must decode to at least one byte')
  }
  opts.secret = base32.encode(secret)
  if (options.issuer !== undefined) {
    if (typeof options.issuer !== 'string' || !options.issuer.trim()) {
      throw new TypeError('Issuer must be a nonempty string')
    }
    opts.issuer = options.issuer
  }
  if (options.algorithm !== undefined) {
    opts.algorithm = validate.algorithm(options.algorithm).toUpperCase()
  }
  if (options.digits !== undefined) {
    opts.digits = validate.digits(options.digits)
  }
  if (options.period !== undefined && type === 'totp') {
    opts.period = validate.period(options.period)
  }
  const params = new URLSearchParams(opts)
  return `otpauth://${type}/${encodeURIComponent(options.label)}?${params.toString()}`
}

export { otpauthURL }
