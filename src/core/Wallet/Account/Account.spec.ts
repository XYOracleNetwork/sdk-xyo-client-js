/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */

import { XyoAccount } from './Account'
import { toUint8Array } from './Key'

//test vectors: https://tools.ietf.org/html/rfc8032
//test tool: https://asecuritysite.com/encryption/ethadd

const testVectorPrivateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
const testVectorPublicKey = 'ed6f3b86542f45aab88ec48ab1366b462bd993fec83e234054afd8f2311fba774800fdb40c04918463b463a6044b83413a604550bfba8f8911beb65475d6528e'
const testVectorAddress = '5e7a847447e7fec41011ae7d32d768f86605ba03'
const testVectorHash = '4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a'
const testVectorSignature = 'b61dad551e910e2793b4f9f880125b5799086510ce102fad0222c1b093c60a6bc755ca10a9068079ac8d9617416a7cd41077093061c1e9bcb2f81812086ae603'

const testPrivateKey = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const testPublicKey = '5f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca54ba511b8b782bc5085962412e8b9879496e3b60bebee7c36987d1d5848b9a50'
const testAddress = '2a260a110bc7b03f19c40a0bd04ff2c5dcb57594'

/*const testVectors = {
  d: 'ebb2c082fd7727890a28ac82f6bdf97bad8de9f5d7c9028692de1a255cad3e0f',
  k: '49a0d7b786ec9cde0d0721d72804befd06571c974b191efb42ecf322ba9ddd9a',
  h: '4b688df40bcedbe641ddb16ff0a1842d9c67ea1c3bf63f3e0471baa664531d1a',
  r: '241097efbf8b63bf145c8961dbdf10c310efbb3b2676bbc0f8b08505c9e2f795',
  s: '021006b7838609339e8b415a7f9acb1b661828131aef1ecbc7955dfb01f3ca0e',
  q: '04779dd197a5df977ed2cf6cb31d82d43328b790dc6b3b7d4437a427bd5847dfcde94b724a555b6d017bb7607c3e3281daf5b1699d6ef4124975c9237b917d426f',
}*/

test('Address from Phrase', () => {
  const wallet = XyoAccount.fromPhrase('test')
  expect(wallet.private).toHaveLength(32)
  expect(wallet.public).toHaveLength(64)
  expect(wallet.addressValue).toHaveLength(20)
  expect(wallet.private.hex).toEqual(testPrivateKey)
  expect(wallet.public.hex).toEqual(testPublicKey)
  expect(wallet.addressValue.hex).toEqual(testAddress)
})

test('Address from Key', () => {
  const wallet = XyoAccount.fromPrivateKey(testVectorPrivateKey)
  expect(wallet.private).toHaveLength(32)
  expect(wallet.public).toHaveLength(64)
  expect(wallet.addressValue).toHaveLength(20)
  expect(wallet.private.hex).toEqual(testVectorPrivateKey)
  expect(wallet.public.hex).toEqual(testVectorPublicKey)
  expect(wallet.addressValue.hex).toEqual(testVectorAddress)
})

test('Sign-fromPrivateKey', () => {
  const wallet = XyoAccount.fromPrivateKey(testVectorPrivateKey)
  const signature = wallet.sign('1234567890abcdef')
  const valid = wallet.verify('1234567890abcdef', signature)
  expect(valid).toBeTruthy()
})

test('Sign-fromPhrase', () => {
  const wallet = XyoAccount.fromPhrase('test')
  const signature = wallet.sign('1234567890abcdef')
  const valid = wallet.verify('1234567890abcdef', signature)
  expect(valid).toBeTruthy()
})

test('Sign-testVectors', () => {
  const wallet = XyoAccount.fromPrivateKey(testVectorPrivateKey)
  const signature = Buffer.from(wallet.sign(toUint8Array(testVectorHash))).toString('hex')
  const expectedSignature = testVectorSignature

  expect(signature).toEqual(expectedSignature)
  expect(signature.length).toEqual(128)
  const valid = wallet.verify(testVectorHash, signature)
  expect(valid).toBeTruthy()
})

test('Constructor', () => {
  const wallet1 = new XyoAccount()
  const wallet2 = new XyoAccount({ privateKey: wallet1.private.bytes })
  expect(wallet1.public.hex).toEqual(wallet2.public.hex)
  expect(wallet1.addressValue.hex).toEqual(wallet2.addressValue.hex)
})

test('Sign-random-string', () => {
  const wallet = XyoAccount.random()
  const signature = wallet.sign('1234567890abcdef')
  const signaturePrime = toUint8Array(signature)
  expect(signature.length).toBe(signaturePrime.length)
  for (let i = 0; i < signature.length; i++) {
    expect(signature[i]).toBe(signaturePrime[i])
  }
  const valid = wallet.verify('1234567890abcdef', signature)
  expect(valid).toBeTruthy()
})
