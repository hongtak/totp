import { randomBytes, createHmac } from 'node:crypto'
import base32 from './base32.js'

function generateSecret (length = 32) {
  const secret = randomBytes(length)
  return base32.encode(secret)
}

function generate (secret, counter, opts = {}) {
  const defaultOpts = {
    digits: 6,
    algorithm: 'sha1'
  }

  Object.assign(defaultOpts, opts)
  const secretBuffer = base32.decode(secret)

  return hmacGenCode(secretBuffer, counter, defaultOpts)
}

function verify (secret, counter, token, opts = {}) {
  const expectedCode = generate(secret, counter, opts)
  return expectedCode === token
}

function hmacGenCode (secretBuffer, counter, opts) {
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigInt64BE(BigInt(counter))

  const hmac = createHmac(opts.algorithm, secretBuffer)
  hmac.update(counterBuffer)
  const hmacResult = hmac.digest()

  const pos = hmacResult[hmacResult.length - 1] & 0x0F
  const num = hmacResult.subarray(pos, pos + 4)
  num[0] &= 0x7F

  const code = num.readUInt32BE() % Math.pow(10, opts.digits)
  return code.toString().padStart(opts.digits, '0')
}

export default {
  generateSecret,
  generate,
  verify
}
