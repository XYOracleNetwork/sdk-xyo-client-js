import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { ArchivistGetQuerySchema, ArchivistInstance } from '@xyo-network/archivist-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'
import { WitnessInstance, WitnessObserveQuerySchema } from '@xyo-network/witness-model'

/**
 * @group module
 */

describe('ModuleResolver', () => {
  let archivist: ArchivistInstance
  let witness: WitnessInstance
  let resolver: CompositeModuleResolver
  beforeAll(async () => {
    archivist = await MemoryArchivist.create({
      account: Account.randomSync(),
      config: { name: 'memory-archivist', schema: MemoryArchivist.configSchema },
    })
    witness = await AdhocWitness.create({ account: Account.randomSync(), config: { schema: AdhocWitnessConfigSchema } })
    resolver = new CompositeModuleResolver()
    resolver.add(archivist)
    resolver.add(witness)
  })
  test('simple by address', async () => {
    expect((await resolver.resolve({ address: [archivist.address] })).length).toBe(1)
    expect((await resolver.resolve({ address: [witness.address] })).length).toBe(1)
  })
  test('simple by name', async () => {
    expect((await resolver.resolve({ name: ['memory-archivist'] })).length).toBe(1)
  })
  test('simple by query', async () => {
    expect((await resolver.resolve({ query: [[ArchivistGetQuerySchema, WitnessObserveQuerySchema]] })).length).toBe(0)
    expect((await resolver.resolve({ query: [[ArchivistGetQuerySchema]] })).length).toBe(1)
    expect((await resolver.resolve({ query: [[WitnessObserveQuerySchema]] })).length).toBe(1)
    expect((await resolver.resolve({ query: [[ArchivistGetQuerySchema], [WitnessObserveQuerySchema]] })).length).toBe(2)
  })
})
