/**
 * @jest-environment jsdom
 */

import { XyoSystemInfoWitnessBrowser } from './SystemInfoBrowser'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const witness = new XyoSystemInfoWitnessBrowser()
    const observation = await witness.observe()
    expect(observation.schema).toBe('network.xyo.system.info')
  })
})
