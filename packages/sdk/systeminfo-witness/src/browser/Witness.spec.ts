/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'

import { XyoSystemInfoBrowserWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoBrowserWitness({
      account: new XyoAccount(),
      schema: 'network.xyo.system.info.config',
      targetSchema: 'network.xyo.system.info.browser',
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info.browser')
  })
})
