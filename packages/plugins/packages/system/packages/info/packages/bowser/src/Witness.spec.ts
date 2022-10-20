/**
 * @jest-environment jsdom
 */

import crypto from 'crypto'

import { XyoBowserSystemInfoSchema } from './Schema'
import { XyoBowserSystemInfoWitness } from './Witness'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoPolyfill = (window: Window & typeof globalThis) => {
  window.crypto = window.crypto ?? {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length),
  }
}

cryptoPolyfill(window)

describe('XyoBowserSystemInfo', () => {
  test('observe', async () => {
    const witness = new XyoBowserSystemInfoWitness()
    const [observation] = await witness.observe()
    expect(observation.schema).toBe(XyoBowserSystemInfoSchema)
  })
})
