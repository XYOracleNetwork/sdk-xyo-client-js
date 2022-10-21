import { XyoMemoryArchivist } from '@xyo-network/archivist'
import { PayloadWrapper } from '@xyo-network/payload'

import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfigSchema } from './Witness'

describe('XyoModuleInstanceWitness', () => {
  test('Witnessing', async () => {
    const module = await XyoMemoryArchivist.create()
    const witness = await XyoModuleInstanceWitness.create({
      config: { module, schema: XyoModuleInstanceWitnessConfigSchema, targetSchema: XyoModuleInstanceSchema },
    })

    const [result] = await witness.observe()

    console.log(`Module: ${JSON.stringify(result, null, 2)}`)

    expect(new PayloadWrapper(result).valid).toBe(true)
  })

  test('Witnessing [no config]', async () => {
    const witness = await XyoModuleInstanceWitness.create()

    const [result] = await witness.observe()

    console.log(`Module: ${JSON.stringify(result, null, 2)}`)

    expect(new PayloadWrapper(result).valid).toBe(true)
  })
})
