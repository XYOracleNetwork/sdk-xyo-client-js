/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'
import crypto from 'crypto'

import { XyoSystemInfoBrowserWitness } from './Witness'

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
      schema: 'network.xyo.system.info.browser.witness.config',
      targetSchema: 'network.xyo.system.info.browser',
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.browser')
  })
})
