const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function encode (input, padding = false) {
  let output = ''
  let buffer = 0
  let bits = 0

  for (let i = 0; i < input.length; i++) {
    buffer = buffer << 8 | input[i]
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

function decode (input) {
  const cleanedInput = input.toUpperCase().replace(/=/g, '')
  const length = cleanedInput.length

  let value = 0
  let index = 0
  let bits = 0

  const output = new Uint8Array(length * 5 / 8 | 0)

  for (const c of cleanedInput) {
    const pos = RFC4648.indexOf(c)
    if (pos < 0) { throw new Error('Not RFC4648') }
    value = value << 5 | pos
    bits += 5

    if (bits >= 8) {
      output[index++] = value >>> bits - 8 & 0xFF
      bits -= 8
    }
  }
  return Buffer.from(output)
}

function maskLastNBits (number, n) {
  const mask = ~(~0 << n)
  return number & mask
}

function padStringToMultiple (str, multiple, padChar) {
  const currentLength = str.length
  const remainder = currentLength % multiple

  if (remainder === 0) {
    return str
  }
  return str.padEnd(currentLength + multiple - remainder, padChar)
}

export default {
  encode,
  decode
}
