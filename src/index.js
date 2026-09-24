import { randomBytes } from 'node:crypto'
import { integer } from './validation.js'
import base32 from './base32.js'
import hotp from './hotp.js'
import totp from './totp.js'
import { otpauthURL } from './otpauthURL.js'

function generateSecret(length = 32) {
  integer(length, 'Secret byte length', 16, 1024)
  const secret = randomBytes(length)
  return base32.encode(secret)
}

export {
  generateSecret,
  hotp,
  totp,
  base32,
  otpauthURL,
}
