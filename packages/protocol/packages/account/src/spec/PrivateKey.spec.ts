import { toUint8Array } from '@xyo-network/core'

import { PrivateKey, WASMPrivateKey } from '../Key'

describe('PrivateKey', () => {
  const privateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
  const hash = 'fb5b56041517511af81784631220865c68e87496be45ae3c89e1098c4e161552'
  const data = toUint8Array(hash)
  const jsPrivateKey = new PrivateKey(privateKey)
  const wasmPrivateKey = new WASMPrivateKey(privateKey)
  describe('sign', () => {
    it('Signatures are consistent', async () => {
      const jsSignature = await jsPrivateKey.sign(data)
      const wasmSignature = await wasmPrivateKey.sign(data)
      expect(jsSignature).toEqual(wasmSignature)
    })
  })
  describe('verify', () => {
    it('Verification is consistent', async () => {
      const jsSignature = await jsPrivateKey.sign(data)
      const wasmSignature = await wasmPrivateKey.sign(data)
      expect(jsPrivateKey.verify(data, jsSignature)).toBeTrue()
      expect(jsPrivateKey.verify(data, wasmSignature)).toBeTrue()
      expect(wasmPrivateKey._verify(data, jsSignature)).resolves.toBeTrue()
      expect(wasmPrivateKey._verify(data, wasmSignature)).resolves.toBeTrue()
    })
    // TODO: Negative testing
  })
})
