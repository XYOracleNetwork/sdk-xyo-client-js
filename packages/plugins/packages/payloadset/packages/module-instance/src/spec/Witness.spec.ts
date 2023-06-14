import { MemoryArchivist } from '@xyo-network/archivist'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AbstractModuleInstanceWitness, AbstractModuleInstanceWitnessConfigSchema } from '../Witness'

describe('AbstractModuleInstanceWitness', () => {
  test('Witnessing', async () => {
    const module = await MemoryArchivist.create()
    const witness = await AbstractModuleInstanceWitness.create({
      config: { schema: AbstractModuleInstanceWitnessConfigSchema },
      module,
    })
    const [result] = await witness.observe()
    expect(await PayloadWrapper.wrap(result).getValid()).toBe(true)
  })

  test('Witnessing [no config]', async () => {
    const witness = await AbstractModuleInstanceWitness.create()
    const [result] = await witness.observe()
    expect(await PayloadWrapper.wrap(result).getValid()).toBe(true)
  })
})
