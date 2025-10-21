import somsom from './totp.js'
import speakeasy from 'speakeasy'

const secret = somsom.generateSecret()
// const secret = 'kjk4aofp4vvrcaofargkz4tqmbxefbo6'
console.log(secret)

const code = somsom.totpGenerate(secret)
console.log(code)

const code2 = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
})

console.log(code2)

const verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: code
})

console.log(verified)

console.log(somsom.totpVerify(secret, code2))
