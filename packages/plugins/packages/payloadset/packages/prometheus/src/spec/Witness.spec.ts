import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { PrometheusNodeWitness } from '../Witness'

describe('PrometheusNodeWitness', () => {
  it('Witnessing [no config]', async () => {
    const witness = await PrometheusNodeWitness.create()
    const observation = await witness.observe()
    expect(observation?.length).toBeGreaterThan(0)
    expect(await PayloadWrapper.wrap(observation[0]).getValid()).toBe(true)
    witness.stop()
  })
})
