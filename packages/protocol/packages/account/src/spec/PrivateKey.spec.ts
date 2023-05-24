import { toUint8Array } from '@xyo-network/core'

import { PrivateKey, WASMPrivateKey } from '../Key'

describe('PrivateKey', () => {
  const privateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
  const hash = 'fb5b56041517511af81784631220865c68e87496be45ae3c89e1098c4e161552'
  it('Signs consistently', async () => {
    const jsPrivateKey = new PrivateKey(privateKey)
    const wasmPrivateKey = new WASMPrivateKey(privateKey)
    const data = toUint8Array(hash)
    const jsSignature = jsPrivateKey.sign(data)
    const wasmSignature = await wasmPrivateKey.sign(data)
    expect(jsSignature).toEqual(wasmSignature)
  })
})
