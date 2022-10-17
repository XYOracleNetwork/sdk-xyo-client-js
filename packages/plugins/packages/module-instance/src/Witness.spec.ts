import { XyoMemoryArchivist } from '@xyo-network/archivist'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfigSchema } from './Witness'

describe('XyoElevationWitness', () => {
  test('Witnessing', async () => {
    const module = await XyoMemoryArchivist.create()
    const witness = await XyoModuleInstanceWitness.create({
      config: { module, schema: XyoModuleInstanceWitnessConfigSchema, targetSchema: XyoModuleInstanceSchema } as XyoWitnessConfig,
    })
    await witness.start()
    const [result] = await witness.observe()

    console.log(`Module: ${JSON.stringify(result, null, 2)}`)

    //expect(result.queries?.length).toBe(2)
  })
})
