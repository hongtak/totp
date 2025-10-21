import { randomBytes, createHmac } from 'node:crypto'
import base32 from './base32.js'

function generateSecret (length = 32) {
  const secret = randomBytes(length)
  return base32.encode(secret)
}

function totpGenerate (secret, timeStep = 30, digits = 6) {
  const now = Date.now()
  const time = Math.floor(now / 1000)
  const counter = Math.floor(time / timeStep)

  return hmacGenCode(secret, counter, digits)
}

function totpVerify (secret, code, timeStep = 30, window = 1) {
  const currentTime = Math.floor(Date.now() / 1000)
  const currentCounter = Math.floor(currentTime / timeStep)
  const digits = code.length

  for (let i = -window; i <= window; i++) {
    const counter = currentCounter + i
    const expectedCode = hmacGenCode(secret, counter, digits)
    if (expectedCode === code) {
      return true
    }
  }
  return false
}

function hmacGenCode (secret, counter, digits) {
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigInt64BE(BigInt(counter))

  const secretBuffer = base32.decode(secret)
  const hmac = createHmac('sha1', secretBuffer)
  hmac.update(counterBuffer)
  const hmacResult = hmac.digest()

  const pos = hmacResult[hmacResult.length - 1] & 0x0F
  const num = hmacResult.subarray(pos, pos + 4)
  num[0] &= 0x7F

  const code = num.readUInt32BE() % Math.pow(10, digits)
  return code.toString().padStart(digits, '0')
}

export default {
  generateSecret,
  totpGenerate,
  totpVerify
}
