/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoAddress } from './Address'
import { toUint8Array } from './toUint8Array'

//test vectors: https://tools.ietf.org/html/rfc8032
//test tool: https://asecuritysite.com/encryption/ethadd

const testVectorPrivateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
const testVectorPublicKey =
  'ed6f3b86542f45aab88ec48ab1366b462bd993fec83e234054afd8f2311fba774800fdb40c04918463b463a6044b83413a604550bfba8f8911beb65475d6528e'
const testVectorAddress = '5e7a847447e7fec41011ae7d32d768f86605ba03'

const testPrivateKey = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const testPublicKey =
  '5f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca54ba511b8b782bc5085962412e8b9879496e3b60bebee7c36987d1d5848b9a50'
const testAddress = '2a260a110bc7b03f19c40a0bd04ff2c5dcb57594'

test('Address from Phrase', () => {
  const address = XyoAddress.fromPhrase('test')
  expect(address.privateKey).toHaveLength(64)
  expect(address.publicKey).toHaveLength(128)
  expect(address.address).toHaveLength(40)
  expect(address.privateKey).toEqual(testPrivateKey)
  expect(address.publicKey).toEqual(testPublicKey)
  expect(address.address).toEqual(testAddress)
})

test('Address from Key', () => {
  const address = XyoAddress.fromPrivateKey(testVectorPrivateKey)
  expect(address.privateKey).toHaveLength(64)
  expect(address.publicKey).toHaveLength(128)
  expect(address.address).toHaveLength(40)
  expect(address.privateKey).toEqual(testVectorPrivateKey)
  expect(address.publicKey).toEqual(testVectorPublicKey)
  expect(address.address).toEqual(testVectorAddress)
})

test('Sign-fromPrivateKey', () => {
  const address = XyoAddress.fromPrivateKey(testVectorPrivateKey)
  const signature = address.sign('x')
  const valid = XyoAddress.verifyAddress('x', signature, address.address)
  expect(valid).toBeTruthy()
})

test('Sign-fromPhrase', () => {
  const address = XyoAddress.fromPhrase('test')
  const signature = address.sign('x')
  const valid = XyoAddress.verifyAddress('x', signature, address.address)
  expect(valid).toBeTruthy()
})

test('Sign-random', () => {
  const address = XyoAddress.random()
  const signature = address.sign('x')
  const valid = XyoAddress.verifyAddress('x', signature, address.address)
  expect(valid).toBeTruthy()
})

test('Constructor', () => {
  const address = new XyoAddress()
  const signature = address.sign('x')
  const valid = XyoAddress.verifyAddress('x', signature, address.address)
  expect(valid).toBeTruthy()
})

test('Sign-random-string', () => {
  const address = XyoAddress.random()
  const signature = address.sign('x')
  const signaturePrime = toUint8Array(signature)
  expect(signature.length).toBe(signaturePrime.length)
  for (let i = 0; i < signature.length; i++) {
    expect(signature[i]).toBe(signaturePrime[i])
  }
  const valid = XyoAddress.verifyAddress('x', signature, address.address)
  expect(valid).toBeTruthy()
})
