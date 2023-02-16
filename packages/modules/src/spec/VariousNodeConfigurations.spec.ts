import { MemoryArchivist } from '@xyo-network/archivist'
import { MemoryAddressHistoryDiviner, MemoryAddressHistoryDivinerConfigSchema } from '@xyo-network/diviner'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { AbstractModule } from '@xyo-network/module'
import { MemoryNode, NodeWrapper } from '@xyo-network/node'

describe('MultiNodeConfiguration', () => {
  let primaryArchivist: AbstractModule
  let primaryNode: MemoryNode
  let primaryNodeWrapper: NodeWrapper

  let leftArchivist: AbstractModule
  let leftDiviner: AbstractModule
  let leftNode: MemoryNode
  let leftNodeWrapper: NodeWrapper

  let rightNode: MemoryNode
  let rightNodeWrapper: NodeWrapper
  let rightArchivist: AbstractModule
  let rightWitness: AbstractModule

  beforeAll(async () => {
    primaryNode = await MemoryNode.create()
    primaryNodeWrapper = new NodeWrapper(primaryNode)
    primaryArchivist = await MemoryArchivist.create()
    primaryNode.register(primaryArchivist, true, 'archivist', true)

    rightNode = await MemoryNode.create()
    rightNodeWrapper = new NodeWrapper(rightNode)
    rightArchivist = await MemoryArchivist.create()
    rightWitness = await IdWitness.create({ config: { salt: 'test', schema: IdWitnessConfigSchema } })
    rightNode.register(rightArchivist)
    rightNode.attach(rightArchivist.address, 'archivist', true)
    rightNode.register(rightWitness)
    rightNode.attach(rightWitness.address, 'witness', true)

    leftNode = await MemoryNode.create()
    leftNodeWrapper = new NodeWrapper(leftNode)
    leftArchivist = await MemoryArchivist.create()
    leftDiviner = await MemoryAddressHistoryDiviner.create({
      config: { address: leftNode.address, schema: MemoryAddressHistoryDivinerConfigSchema },
    })
    leftNode.register(leftArchivist)
    leftNode.attach(leftArchivist.address, 'archivist', true)
    leftNode.register(leftDiviner)
    leftNode.attach(leftDiviner.address, 'diviner', true)

    primaryNode.register(leftNode)
    primaryNode.register(rightNode)
  })
  test('leftNode', async () => {
    primaryNode.attach(leftNode.address, 'left', true)
    primaryNode.detach(rightNode.address)
    expect((await primaryNode.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await leftNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await rightNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [leftNode.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [rightNode.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [rightWitness.address] })).length).toBe(0)
  })

  test('rightNode', async () => {
    primaryNode.attach(rightNode.address, 'right', true)
    primaryNode.detach(leftNode.address)
    expect((await primaryNode.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await leftNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await rightNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [rightNode.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [leftNode.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [leftDiviner.address] })).length).toBe(0)
  })
})
