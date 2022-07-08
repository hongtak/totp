import { createHmac } from 'node:crypto'

// otpauth://totp/hongtak@gmail.com?secret=go7tdq5ksuinqxht

const base32 = 'MYONJOSVRMKN3ZFWHTST5SZ3WBTSOSKADVXP4MDFL4WJM3JTZEAQ'.toUpperCase()
const code1 = totp(base32)
console.log(code1)
// ----------

function totp (secret) {
  const secretBuf = base32decode(secret)

  const now = Date.now()
  const time = Math.floor(now / 30000)

  const tbuf = Buffer.alloc(8)
  tbuf.writeUInt32BE(time, 4)
  const hmac = createHmac('sha1', secretBuf)
  hmac.update(tbuf)
  const output = hmac.digest()
  const code = hmac2num(output)
  return code.toString().padStart(6, '0')  
}

function base32decode(input) {
  const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const length = input.length
  
  let bits = 0
  let value = 0
  let index = 0
  const output = new Uint8Array((length * 5 / 8) | 0)

  for (const c of input) {
    const pos = RFC4648.indexOf(c)
    if (pos < 0) { throw new Error('Not RFC4648') }
    value = (value << 5) | pos
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }
  return Buffer.from(output)
}

function hmac2num (hmac) {
  const pos = hmac[hmac.length - 1] & 0x0F
  const num = hmac.subarray(pos, pos + 4)
  num[0] &= 0x7F
  return num.readUInt32BE() % 1000000
}
