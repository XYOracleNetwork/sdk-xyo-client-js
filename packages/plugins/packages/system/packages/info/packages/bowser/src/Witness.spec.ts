/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'
import crypto from 'crypto'

import { XyoBowserSystemInfoWitnessConfigSchema } from './Config'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'
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
    const witness = new XyoBowserSystemInfoWitness({
      account: new XyoAccount(),
      schema: XyoBowserSystemInfoWitnessConfigSchema,
      targetSchema: XyoBowserSystemInfoPayloadSchema,
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe(XyoBowserSystemInfoPayloadSchema)
  })
})
