import { toUint8Array } from '@xylabs/arraybuffer'
import type { PrivateKeyInstance } from '@xyo-network/key-model'

import { PrivateKey } from '../Key/index.ts'

const verifyTestIterations = 10

describe('PrivateKey', () => {
  const privateKeyBytes = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
  const hashes = [
    // These hashes are equivalent without malleation
    'a8830c30b02d8b96e6737ae2d785b4474e603ff477f84f5fbf36b24ce01450d9',
    '51477030d1afe852c37585d4604387ae67878a14c9db4408eba383fe4f70c937',
    'a6e03a62583bb512739f9f1be158dde355406134d7b94fdc35de63d252021be3',

    // These hashes are equivalent with malleation
    // 'fb5b56041517511af81784631220865c68e87496be45ae3c89e1098c4e161552',
    // 'e2acaf9e7ee743da8be0ec70717ac1814f18f19aa1fda213185790bed5dd2074',
    // 'cb3c59cd01d32271512287200a63d69e7c49936ec4a6b9c1e12c34faf2e2909a',
  ]
  const hash = hashes[0]
  const data = toUint8Array(hash)
  describe('verify', () => {
    let privateKey: PrivateKeyInstance
    beforeAll(async () => {
      privateKey = await PrivateKey.create(toUint8Array(privateKeyBytes))
    })
    it.each(hashes)('Verification is consistent', async (hash) => {
      const data = toUint8Array(hash)
      const wasmSignature = await privateKey.sign(data)
      const wasmVerify = await privateKey.verify(data, wasmSignature)
      expect(wasmVerify).toBeTruthy()
    })
    // TODO: Negative verification testing
    test('wasm vs js (performance-serial)', async () => {
      const wasmSignature = await privateKey.sign(data)
      for (let x = 0; x < verifyTestIterations; x++) {
        await privateKey.verify(data, wasmSignature)
      }
    }, 60_000)
  })
})
