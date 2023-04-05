/* eslint-disable import/no-internal-modules */
import { ArchivistGetQuerySchema, MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { AbstractModule, CompositeModuleResolver } from '@xyo-network/module'
import { WitnessObserveQuerySchema } from '@xyo-network/witness'

describe('XyoModuleResolver', () => {
  let archivist: AbstractModule
  let witness: AbstractModule
  let resolver: CompositeModuleResolver
  beforeAll(async () => {
    archivist = await MemoryArchivist.create({ config: { name: 'memory-archivist', schema: MemoryArchivistConfigSchema } })
    witness = await IdWitness.create({ config: { salt: 'test', schema: IdWitnessConfigSchema } })
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
