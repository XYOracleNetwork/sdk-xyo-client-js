/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'
import crypto from 'crypto'

import { XyoSystemInfoBrowserPayloadSchema } from './Payload'
import { XyoSystemInfoBrowserWitness, XyoSystemInfoBrowserWitnessConfigSchema } from './Witness'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoPolyfill = (window: Window & typeof globalThis) => {
  window.crypto = window.crypto ?? {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length),
  }
}

cryptoPolyfill(window)

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoBrowserWitness({
      account: new XyoAccount(),
      schema: XyoSystemInfoBrowserWitnessConfigSchema,
      targetSchema: XyoSystemInfoBrowserPayloadSchema,
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe(XyoSystemInfoBrowserPayloadSchema)
  })
})
