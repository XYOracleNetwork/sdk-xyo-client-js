/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'

import { XyoIdWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoIdWitness({
      account: new XyoAccount(),
      schema: 'network.xyo.id.config',
      targetSchema: 'network.xyo.id',
    })
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.id')
  })
})
