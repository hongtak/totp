const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function encode(input, padding = false) {
  let output = ''
  let buffer = 0
  let bits = 0

  for (const byte of input) {
    buffer = buffer << 8 | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      const pos = buffer >> bits & 0x1F
      buffer = maskLastNBits(buffer, bits)
      output += RFC4648[pos]
    }
  }

  if (bits > 0) {
    const pos = buffer << 5 - bits & 0x1F
    output += RFC4648[pos]
  }

  if (padding) {
    return padStringToMultiple(output, 8, '=')
  } else {
    return output
  }
}

function decode(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Base32 input must be a string')
  }
  if (!/^[A-Za-z2-7]*=*$/.test(input)) {
    throw new Error('Invalid Base32 alphabet or padding')
  }
  const normalized = input.toUpperCase()
  const cleanedInput = normalized.replace(/=+$/, '')
  const remainder = cleanedInput.length % 8
  if (![0, 2, 4, 5, 7].includes(remainder)
    || (normalized.includes('=') && (remainder === 0 || normalized.length !== Math.ceil(cleanedInput.length / 8) * 8))) {
    throw new Error('Invalid Base32 length or padding')
  }
  const length = cleanedInput.length

  let value = 0
  let index = 0
  let bits = 0

  const output = new Uint8Array(length * 5 / 8 | 0)

  for (const c of cleanedInput) {
    const pos = RFC4648.indexOf(c)
    if (pos < 0) {
      throw new Error('Not RFC4648')
    }
    value = value << 5 | pos
    bits += 5

    if (bits >= 8) {
      output[index++] = value >>> bits - 8 & 0xFF
      bits -= 8
    }
  }
  const result = Buffer.from(output)
  if (encode(result) !== cleanedInput) {
    throw new Error('Invalid Base32 trailing bits')
  }
  return result
}

function maskLastNBits(number, n) {
  const mask = ~(~0 << n)
  return number & mask
}

function padStringToMultiple(str, multiple, padChar) {
  const currentLength = str.length
  const remainder = currentLength % multiple

  if (remainder === 0) {
    return str
  }
  return str.padEnd(currentLength + multiple - remainder, padChar)
}

export default {
  encode,
  decode,
}
