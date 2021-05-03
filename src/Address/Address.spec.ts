/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import XyoAddress from './Address'

//test vectors: https://tools.ietf.org/html/rfc8032

const testVectorPrivateKey = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
const testVectorPublicKey = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a'

const testPrivateKey = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const testPublicKey = '67d3b5eaf0c0bf6b5a602d359daecc86a7a74053490ec37ae08e71360587c870'

test('Address from Phrase (Private)', async () => {
  const address = await XyoAddress.fromPhrase('test')
  expect(address.privateKey).toHaveLength(64)
})

test('Address from Phrase (Public)', async () => {
  const address = await XyoAddress.fromPhrase('test')
  expect(address.publicKey).toHaveLength(64)
})

test('Address from Phrase (Private)', async () => {
  const addressFromPhrase = await XyoAddress.fromPhrase('test')
  expect(addressFromPhrase.privateKey).toEqual(testPrivateKey)
})

test('Address from Phrase (Public)', async () => {
  const addressFromPhrase = await XyoAddress.fromPhrase('test')
  expect(addressFromPhrase.publicKey).toEqual(testPublicKey)
})

test('Address from Key (Private)', async () => {
  const addressFromKey = await XyoAddress.fromPrivateKey(testVectorPrivateKey)
  expect(addressFromKey.privateKey).toEqual(testVectorPrivateKey)
})

test('Address from Key (Public)', async () => {
  const addressFromKey = await XyoAddress.fromPrivateKey(testVectorPrivateKey)
  expect(addressFromKey.publicKey).toEqual(testVectorPublicKey)
})
