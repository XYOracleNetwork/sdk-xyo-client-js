import { Module, XyoModule } from '@xyo-network/module'
import { PayloadWrapper, XyoPayloadBuilder } from '@xyo-network/payload'

import { Witness } from './Witness'
import { XyoWitness } from './XyoWitness'
import { XyoWitnessWrapper } from './XyoWitnessWrapper'

test('XyoWitness', async () => {
  const schema = 'network.xyo.debug'
  const witness = await XyoWitness.create({
    config: { schema: 'xyo.network.test.witness.config', targetSchema: 'xyo.network.test' },
  })
  const payload = new XyoPayloadBuilder({ schema }).build()
  const witnessAsModule: Module = witness
  const witnessAsWitness: Witness = witness
  const witnessAsXyoModule: XyoModule = witness
  const wrapper = new XyoWitnessWrapper(witnessAsModule ?? witnessAsXyoModule ?? witnessAsWitness)

  const payloads = await wrapper.observe([payload])
  expect(payloads).toBeArray()
  expect(payloads.length).toBeGreaterThan(0)
  const answerWrapper = new PayloadWrapper(payloads[0])

  expect(answerWrapper.schema).toBe(schema)
  expect(answerWrapper.valid).toBe(true)
})
