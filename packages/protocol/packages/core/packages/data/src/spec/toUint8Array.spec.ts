import '@xylabs/vitest-extended'

import { toUint8Array } from '@xylabs/sdk-js'
import {
  describe, expect, test,
} from 'vitest'

describe('toUint8Array', () => {
  test('Uint8Array Round Trip', () => {
    const testArray = Uint8Array.from([0, 1, 2, 3])
    const testArrayPrime = toUint8Array(testArray.buffer)
    expect(testArray.length).toBe(testArrayPrime.length)
    for (const [i, element] of testArray.entries()) {
      expect(element).toBe(testArrayPrime[i])
    }
  })
  test('Hex Round Trip', () => {
    const testHex = '1a2b3c'
    const testHexPrime = Buffer.from(toUint8Array(testHex)).toString('hex')
    expect(testHex).toBe(testHexPrime)
  })
})
