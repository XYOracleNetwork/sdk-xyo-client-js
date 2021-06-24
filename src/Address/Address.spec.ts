/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import XyoAddress from './Address'

//test vectors: https://tools.ietf.org/html/rfc8032

const testVectorPrivateKey = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60'
const testVectorPublicKey = '667fef5f7578a801037ed144092dcf7c7c44e3bf3e09cfc8a67fcf70fcd8123a'

const testPrivateKey = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
const testPublicKey = 'be9a880a7f5334a8e50bd701bd38c6def25369c7084b5be4d5b1022886835212'

test('Address from Phrase', () => {
  const address = XyoAddress.fromPhrase('test')
  expect(address.privateKey).toHaveLength(64)
  expect(address.publicKey).toHaveLength(64)
  expect(address.privateKey).toEqual(testPrivateKey)
  expect(address.publicKey).toEqual(testPublicKey)
})

test('Address from Key', () => {
  const address = XyoAddress.fromPrivateKey(testVectorPrivateKey)
  expect(address.privateKey).toHaveLength(64)
  expect(address.publicKey).toHaveLength(64)
  expect(address.privateKey).toEqual(testVectorPrivateKey)
  expect(address.publicKey).toEqual(testVectorPublicKey)
})
