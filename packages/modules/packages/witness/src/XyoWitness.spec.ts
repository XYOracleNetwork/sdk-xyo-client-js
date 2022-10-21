import { Module, XyoModule } from '@xyo-network/module'
import { PayloadWrapper } from '@xyo-network/payload'

import { Witness } from './Witness'
import { XyoWitness } from './XyoWitness'
import { XyoWitnessWrapper } from './XyoWitnessWrapper'

test('XyoWitness', async () => {
  const witness = await XyoWitness.create({
    config: { schema: 'xyo.network.test.witness.config', targetSchema: 'xyo.network.test' },
  })
  const witnessAsModule: Module = witness
  const witnessAsWitness: Witness = witness
  const witnessAsXyoModule: XyoModule = witness
  const wrapper = new XyoWitnessWrapper(witnessAsModule ?? witnessAsXyoModule ?? witnessAsWitness)

  const payloads = await wrapper.observe()
  const answerWrapper = new PayloadWrapper(payloads[0])

  expect(answerWrapper.schema).toBe('xyo.network.test')
  expect(answerWrapper.valid).toBe(true)
})
