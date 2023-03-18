import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { PrometheusNodeWitness } from '../Witness'

describe('PrometheusNodeWitness', () => {
  it('Witnessing [no config]', async () => {
    const witness = await PrometheusNodeWitness.create()
    const observation = await witness.observe()
    console.log(JSON.stringify(observation, null, 2))
    expect(observation?.length).toBeGreaterThan(0)
    expect(new PayloadWrapper(observation[0]).valid).toBe(true)
    witness.stop()
  })
})
