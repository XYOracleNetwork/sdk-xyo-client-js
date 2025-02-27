import '@xylabs/vitest-extended'

import { MemoryArchivist } from '@xyo-network/archivist-memory'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'
import type { WitnessInstance } from '@xyo-network/witness-model'
import {
  beforeAll,
  describe, expect, test,
} from 'vitest'

/**
 * @group module
 */

describe('ModuleResolver', () => {
  let archivist: ArchivistInstance
  let witness: WitnessInstance
  let resolver: CompositeModuleResolver
  beforeAll(async () => {
    archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'memory-archivist', schema: MemoryArchivist.defaultConfigSchema },
    })
    witness = await AdhocWitness.create({ account: 'random', config: { schema: AdhocWitnessConfigSchema } })
    resolver = new CompositeModuleResolver({ root: archivist })
    resolver.add(archivist)
    resolver.add(witness)
  })
  test('simple by address', async () => {
    expect((await resolver.resolve(archivist.address))).toBeDefined()
    expect((await resolver.resolve(witness.address))).toBeDefined()
  })
  test('simple by name', async () => {
    expect((await resolver.resolve('memory-archivist'))).toBeDefined()
  })
})
