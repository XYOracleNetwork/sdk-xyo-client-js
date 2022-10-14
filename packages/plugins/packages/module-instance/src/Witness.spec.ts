import { XyoMemoryArchivist } from '@xyo-network/archivist'

import { XyoModuleInstanceSchema } from './Schema'
import { XyoModuleInstanceWitness, XyoModuleInstanceWitnessConfigSchema } from './Witness'

describe('XyoElevationWitness', () => {
  test('Witnessing', async () => {
    const module = new XyoMemoryArchivist()
    const witness = new XyoModuleInstanceWitness({
      config: { module, schema: XyoModuleInstanceWitnessConfigSchema, targetSchema: XyoModuleInstanceSchema },
    })
    await witness.start()
    const [result] = await witness.observe()

    console.log(`Module: ${JSON.stringify(result, null, 2)}`)

    //expect(result.queries?.length).toBe(2)
  })
})
