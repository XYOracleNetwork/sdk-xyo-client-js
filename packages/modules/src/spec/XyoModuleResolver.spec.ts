/* eslint-disable import/no-internal-modules */
import { HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { ArchivistGetQuerySchema, ArchivistInstance } from '@xyo-network/archivist-model'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { CompositeModuleResolver } from '@xyo-network/module'
import { WitnessInstance, WitnessObserveQuerySchema } from '@xyo-network/witness'

describe('ModuleResolver', () => {
  let archivist: ArchivistInstance
  let witness: WitnessInstance
  let resolver: CompositeModuleResolver
  beforeAll(async () => {
    archivist = await MemoryArchivist.create({
      account: await HDWallet.random(),
      config: { name: 'memory-archivist', schema: MemoryArchivist.configSchema },
    })
    witness = await IdWitness.create({ account: await HDWallet.random(), config: { salt: 'test', schema: IdWitnessConfigSchema } })
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
