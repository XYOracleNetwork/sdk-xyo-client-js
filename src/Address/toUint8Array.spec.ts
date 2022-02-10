import { toUint8Array } from './toUint8Array'

describe('toUint8Array', () => {
  test('Uint8Array Round Trip', () => {
    const testArray = Uint8Array.from([0, 1, 2, 3])
    const testArrayPrime = toUint8Array(testArray)
    expect(testArray.length).toBe(testArrayPrime.length)
    for (let i = 0; i < testArray.length; i++) {
      expect(testArray[i]).toBe(testArrayPrime[i])
    }
  })
  test('Hex Round Trip', () => {
    const testHex = '1a2b3c'
    const testHexPrime = Buffer.from(toUint8Array(testHex)).toString('hex')
    expect(testHex).toBe(testHexPrime)
  })
})
