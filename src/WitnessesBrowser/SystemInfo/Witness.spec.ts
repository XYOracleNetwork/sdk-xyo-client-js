/**
 * @jest-environment jsdom
 */

import { XyoSystemInfoBrowserWitness } from './Witness'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoBrowserWitness()
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info')
  })
})
