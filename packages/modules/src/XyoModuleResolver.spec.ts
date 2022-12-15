/* eslint-disable import/no-internal-modules */
import { MemoryArchivist, XyoArchivistGetQuerySchema } from '@xyo-network/archivist'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { AbstractModule, AbstractModuleResolver } from '@xyo-network/module'
import { XyoWitnessObserveQuerySchema } from '@xyo-network/witness'

describe('XyoModuleResolver', () => {
  let archivist: XyoModule
  let witness: XyoModule
  let resolver: XyoModuleResolver
  beforeAll(async () => {
    archivist = await MemoryArchivist.create()
    witness = await IdWitness.create({ config: { salt: 'test', schema: IdWitnessConfigSchema } })
    resolver = new XyoModuleResolver()
    resolver.add(archivist)
    resolver.add(witness)
  })
  test('simple by address', async () => {
    expect((await resolver.resolve({ address: [archivist.address] })).length).toBe(1)
    expect((await resolver.resolve({ address: [witness.address] })).length).toBe(1)
  })
  test('simple by config', async () => {

    expect((await resolver.resolve({ config: [MemoryArchivist.configSchema] })).length).toBe(1)
    expect((await resolver.resolve({ config: [IdWitness.configSchema] })).length).toBe(1)
  })
  test('simple by query', async () => {
    expect((await resolver.resolve({ query: [[XyoArchivistGetQuerySchema, XyoWitnessObserveQuerySchema]] })).length).toBe(0)
    expect((await resolver.resolve({ query: [[XyoArchivistGetQuerySchema]] })).length).toBe(1)
    expect((await resolver.resolve({ query: [[XyoWitnessObserveQuerySchema]] })).length).toBe(1)
    expect((await resolver.resolve({ query: [[XyoArchivistGetQuerySchema], [XyoWitnessObserveQuerySchema]] })).length).toBe(2)
  })
})
