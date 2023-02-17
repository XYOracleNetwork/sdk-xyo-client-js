import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { MemoryAddressHistoryDiviner, MemoryAddressHistoryDivinerConfigSchema } from '@xyo-network/diviner'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { AbstractModule } from '@xyo-network/module'
import { MemoryNode, NodeConfigSchema, NodeWrapper } from '@xyo-network/node'

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
    primaryNode = await MemoryNode.create({ config: { name: 'primaryNode', schema: NodeConfigSchema } })
    primaryNodeWrapper = new NodeWrapper(primaryNode)
    primaryArchivist = await MemoryArchivist.create({ config: { name: 'primaryArchivist', schema: MemoryArchivistConfigSchema } })
    primaryNode.register(primaryArchivist).attach(primaryArchivist.address, true)

    rightNode = await MemoryNode.create({ config: { name: 'rightNode', schema: NodeConfigSchema } })
    rightNodeWrapper = new NodeWrapper(rightNode)
    rightArchivist = await MemoryArchivist.create()
    rightWitness = await IdWitness.create({ config: { name: 'rightWitness', salt: 'test', schema: IdWitnessConfigSchema } })
    rightNode.register(rightArchivist).attach(rightArchivist.address, true)
    rightNode.register(rightWitness).attach(rightWitness.address, true)

    leftNode = await MemoryNode.create({ config: { name: 'leftNode', schema: NodeConfigSchema } })
    leftNodeWrapper = new NodeWrapper(leftNode)
    leftArchivist = await MemoryArchivist.create({ config: { name: 'leftArchivist', schema: MemoryArchivistConfigSchema } })
    leftDiviner = await MemoryAddressHistoryDiviner.create({
      config: { address: leftNode.address, name: 'leftDiviner', schema: MemoryAddressHistoryDivinerConfigSchema },
    })
    leftNode.register(leftArchivist).attach(leftArchivist.address, true)
    leftNode.register(leftDiviner).attach(leftDiviner.address, true)

    primaryNode.register(leftNode)
    primaryNode.register(rightNode)
  })
  test('leftNode', async () => {
    primaryNode.attach(leftNode.address, true)
    primaryNode.detach(rightNode.address)
    expect((await primaryNode.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['primaryArchivist'] })).length).toBe(1)

    expect((await leftNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await leftNode.resolve({ name: ['leftDiviner'] })).length).toBe(1)

    expect((await rightNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await rightNode.resolve({ name: ['rightWitness'] })).length).toBe(1)

    expect((await primaryNode.resolve({ address: [leftNode.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['leftNode'] })).length).toBe(1)

    expect((await primaryNode.resolve({ address: [rightNode.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['rightNode'] })).length).toBe(0)

    expect((await primaryNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['leftDiviner'] })).length).toBe(1)

    expect((await primaryNode.resolve({ address: [rightWitness.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['rightWitness'] })).length).toBe(0)
  })

  test('rightNode', async () => {
    primaryNode.attach(rightNode.address, true)
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
