import { toUint8Array } from '@xyo-network/core'

import { PrivateKey, WASMPrivateKey } from '../Key'

const signTestIterations = 100
const verifyTestIterations = 10

describe('PrivateKey', () => {
  const privateKey = '7f71bc5644f8f521f7e9b73f7a391e82c05432f8a9d36c44d6b1edbf1d8db62f'
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
  const jsPrivateKey = new PrivateKey(privateKey)
  const wasmPrivateKey = new WASMPrivateKey(privateKey)
  describe('sign', () => {
    it.each(hashes)('Signatures are consistent', async (hash) => {
      const data = toUint8Array(hash)
      const jsSignature = await jsPrivateKey.sign(data)
      const wasmSignature = await wasmPrivateKey.sign(data)
      expect(jsSignature).toEqual(wasmSignature)
    })
    test('wasm vs js (performance-serial)', async () => {
      const jsStart = Date.now()
      for (let x = 0; x < signTestIterations; x++) {
        await jsPrivateKey.sign(data)
      }
      const jsDuration = Date.now() - jsStart
      const wasmStart = Date.now()
      for (let x = 0; x < signTestIterations; x++) {
        await wasmPrivateKey.sign(data)
      }
      const wasmDuration = Date.now() - wasmStart
      expect(wasmDuration).toBeDefined()
      expect(jsDuration).toBeDefined()
      logPerformanceResults(jsDuration, wasmDuration)
    })
  })
  describe('verify', () => {
    it.each(hashes)('Verification is consistent', async (hash) => {
      const data = toUint8Array(hash)
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
      for (let x = 0; x < verifyTestIterations; x++) {
        await jsPrivateKey.verify(data, jsSignature)
      }
      const jsDuration = Date.now() - jsStart
      const wasmStart = Date.now()
      for (let x = 0; x < verifyTestIterations; x++) {
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
