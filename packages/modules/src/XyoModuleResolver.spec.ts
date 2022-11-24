/* eslint-disable import/no-internal-modules */
import { MemoryArchivist, XyoArchivistGetQuerySchema } from '@xyo-network/archivist'
import { XyoIdSchema, XyoIdWitness, XyoIdWitnessConfigSchema } from '@xyo-network/id-payload-plugin'
import { XyoModule, XyoModuleResolver } from '@xyo-network/module'
import { XyoWitnessObserveQuerySchema } from '@xyo-network/witness'

describe('XyoModuleResolver', () => {
  test('simple by address', async () => {
    const archivist: XyoModule = await MemoryArchivist.create()
    const witness = await XyoIdWitness.create({ config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } })

    const resolver = new XyoModuleResolver()
    resolver.add(archivist)
    resolver.add(witness)

    expect((await resolver.resolve({ address: [archivist.address] })).length).toBe(1)
    expect((await resolver.resolve({ address: [witness.address] })).length).toBe(1)
  })
  test('simple by config', async () => {
    const archivist: XyoModule = await MemoryArchivist.create()
    const witness = await XyoIdWitness.create({ config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } })

    const resolver = new XyoModuleResolver()
    resolver.add(archivist)
    resolver.add(witness)

    expect((await resolver.resolve({ config: [MemoryArchivist.configSchema] })).length).toBe(1)
    expect((await resolver.resolve({ config: [XyoIdWitness.configSchema] })).length).toBe(1)
  })
  test('simple by query', async () => {
    const archivist: XyoModule = await MemoryArchivist.create()
    const witness = await XyoIdWitness.create({ config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } })

    const resolver = new XyoModuleResolver()
    resolver.add(archivist)
    resolver.add(witness)

    expect((await resolver.resolve({ query: [[XyoArchivistGetQuerySchema, XyoWitnessObserveQuerySchema]] })).length).toBe(0)
    expect((await resolver.resolve({ query: [[XyoArchivistGetQuerySchema]] })).length).toBe(1)
    expect((await resolver.resolve({ query: [[XyoWitnessObserveQuerySchema]] })).length).toBe(1)
    expect((await resolver.resolve({ query: [[XyoArchivistGetQuerySchema], [XyoWitnessObserveQuerySchema]] })).length).toBe(2)
  })
})
