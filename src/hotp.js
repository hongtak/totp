import { createHmac, timingSafeEqual } from 'node:crypto'
import base32 from './base32.js'
import * as validate from './validation.js'

function generate(secret, counter, opts = {}) {
  validate.options(opts)
  const digits = validate.digits(opts.digits)
  const algorithm = validate.algorithm(opts.algorithm)
  const secretBuffer = base32.decode(secret)
  if (secretBuffer.length === 0) {
    throw new RangeError('Secret must decode to at least one byte')
  }
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(validate.counter(counter))
  const digest = createHmac(algorithm, secretBuffer).update(counterBuffer).digest()
  const offset = digest[digest.length - 1] & 0x0F
  const value = digest.readUInt32BE(offset) & 0x7FFFFFFF
  return (value % 10 ** digits).toString().padStart(digits, '0')
}

function matches(expected, token) {
  if (typeof token !== 'string' || token.length !== expected.length || !/^[0-9]+$/.test(token)) {
    return false
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

function verify(secret, counter, token, opts = {}) {
  return matches(generate(secret, counter, opts), token)
}

export { matches }
export default { generate, verify }
