import { toUint8Array } from '@xyo-network/core'

import { PrivateKey, WASMPrivateKey } from '../Key'

const testIterations = 100

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
    test('wasm vs js (performance-serial)', async () => {
      const jsStart = Date.now()
      for (let x = 0; x < testIterations; x++) {
        await jsPrivateKey.sign(data)
      }
      const jsDuration = Date.now() - jsStart
      const wasmStart = Date.now()
      for (let x = 0; x < testIterations; x++) {
        await wasmPrivateKey.sign(data)
      }
      const wasmDuration = Date.now() - wasmStart
      expect(wasmDuration).toBeDefined()
      expect(jsDuration).toBeDefined()
      logPerformanceResults(jsDuration, wasmDuration)
    })
  })
  describe('verify', () => {
    it('Verification is consistent', async () => {
      const jsSignature = await jsPrivateKey.sign(data)
      const wasmSignature = await wasmPrivateKey.sign(data)
      expect(jsPrivateKey.verify(data, jsSignature)).toBeTrue()
      expect(jsPrivateKey.verify(data, wasmSignature)).toBeTrue()
      expect(wasmPrivateKey.verify(data, jsSignature)).resolves.toBeTrue()
      expect(wasmPrivateKey.verify(data, wasmSignature)).resolves.toBeTrue()
    })
    // TODO: Negative verification testing
    test('wasm vs js (performance-serial)', async () => {
      const jsSignature = await jsPrivateKey.sign(data)
      const wasmSignature = await wasmPrivateKey.sign(data)
      const jsStart = Date.now()
      for (let x = 0; x < testIterations; x++) {
        await jsPrivateKey.verify(data, jsSignature)
      }
      const jsDuration = Date.now() - jsStart
      const wasmStart = Date.now()
      for (let x = 0; x < testIterations; x++) {
        await wasmPrivateKey.verify(data, wasmSignature)
      }
      const wasmDuration = Date.now() - wasmStart
      logPerformanceResults(jsDuration, wasmDuration)
    }, 60_000)
  })
})

const logPerformanceResults = (jsDuration: number, wasmDuration: number) => {
  expect(wasmDuration).toBeDefined()
  expect(jsDuration).toBeDefined()
  const delta = jsDuration - wasmDuration
  const magnitude = (jsDuration / wasmDuration).toPrecision(4)
  console.log(`Wasm is ${delta}ms (${magnitude} times) faster [${wasmDuration}ms vs ${jsDuration}ms ]`)
}
