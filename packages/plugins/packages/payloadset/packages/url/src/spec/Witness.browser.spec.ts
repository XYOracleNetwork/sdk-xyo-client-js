/**
 * @jest-environment jsdom
 */

import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { UrlWitness, UrlWitnessConfigSchema } from '../Witness/Witness'

describe('UrlWitness [Browser]', () => {
  test('observe', async () => {
    const witness = await UrlWitness.create({
      config: { salt: 'test', schema: UrlWitnessConfigSchema },
    })
    const [observation] = await witness.observe([{ salt: 'test', schema: UrlSchema } as Payload])
    expect(observation.schema).toBe(UrlSchema)
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })

  test('observe [no config]', async () => {
    const witness = await UrlWitness.create()
    const [observation] = await witness.observe([{ salt: 'test', schema: UrlSchema } as Payload])
    expect(observation.schema).toBe(UrlSchema)
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })
})
