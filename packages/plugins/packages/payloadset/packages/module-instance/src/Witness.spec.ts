import { MemoryArchivist } from '@xyo-network/archivist'
import { PayloadWrapper } from '@xyo-network/payload'

import { AbstractModuleInstanceWitness, AbstractModuleInstanceWitnessConfigSchema } from './Witness'

describe('AbstractModuleInstanceWitness', () => {
  test('Witnessing', async () => {
    const module = await MemoryArchivist.create()
    const witness = await AbstractModuleInstanceWitness.create({
      config: { module, schema: AbstractModuleInstanceWitnessConfigSchema },
    })
    const [result] = await witness.observe()
    expect(new PayloadWrapper(result).valid).toBe(true)
  })

  test('Witnessing [no config]', async () => {
    const witness = await AbstractModuleInstanceWitness.create()
    const [result] = await witness.observe()
    expect(new PayloadWrapper(result).valid).toBe(true)
  })
})
