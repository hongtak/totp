import { URLSearchParams } from 'url'

function otpauthURL (options) {
  const opts = { }
  const types = ['totp', 'hotp']
  const algorithms = ['SHA1', 'SHA256', 'SHA512']

  const type = options.type || 'totp'
  if (!types.includes(type)) {
    throw new Error(`Invalid type ${options.type}`)
  }

  if (type === 'hotp') {
    if (typeof options.counter !== 'number') {
      throw new Error('Counter is required for HOTP')
    }
    opts.counter = options.counter
  }

  if (!options.label) {
    throw new Error('Label is required')
  }

  if (!options.secret) {
    throw new Error('Secret is required')
  }
  opts.secret = options.secret

  if (options.issuer) {
    opts.issuer = options.issuer
  }

  if (options.algorithm) {
    if (!algorithms.includes(options.algorithm.toUpperCase())) {
      console.warn(`Warning: Unknown algorithm ${options.algorithm}`)
    }
    opts.algorithm = options.algorithm.toUpperCase()
  }

  if (options.digits) {
    opts.digits = options.digits
  }

  if (options.period && type === 'totp') {
    opts.period = options.period
  }

  const params = new URLSearchParams(opts)
  const otpauthURL = `otpauth://${type}/${encodeURIComponent(options.label)}?${params.toString()}`
  return otpauthURL
}

export { otpauthURL }
