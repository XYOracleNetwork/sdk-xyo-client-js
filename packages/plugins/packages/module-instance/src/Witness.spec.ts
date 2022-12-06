import { MemoryArchivist } from '@xyo-network/archivist'
import { PayloadWrapper } from '@xyo-network/payload'

import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfigSchema } from './Witness'

describe('XyoModuleInstanceWitness', () => {
  test('Witnessing', async () => {
    const module = await MemoryArchivist.create()
    const witness = await XyoModuleInstanceWitness.create({
      config: { module, schema: XyoModuleInstanceWitnessConfigSchema },
    })
    const [result] = await witness.observe()
    expect(new PayloadWrapper(result).valid).toBe(true)
  })

  test('Witnessing [no config]', async () => {
    const witness = await XyoModuleInstanceWitness.create()
    const [result] = await witness.observe()
    expect(new PayloadWrapper(result).valid).toBe(true)
  })
})
