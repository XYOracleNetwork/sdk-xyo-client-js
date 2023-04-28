/* eslint-disable max-statements */
import { ArchivistWrapper, MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { AddressHistoryDiviner, AddressHistoryDivinerConfigSchema } from '@xyo-network/diviner-address-history'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { AbstractModule } from '@xyo-network/module'
import { MemoryNode, NodeConfigSchema, NodeWrapper } from '@xyo-network/node'

describe('MultiNodeConfiguration', () => {
  let primaryArchivist: AbstractModule
  let primaryNode: MemoryNode

  let leftInternalArchivist: AbstractModule
  let leftInternalArchivist2: AbstractModule
  let leftExternalArchivist: AbstractModule
  let leftDiviner: AbstractModule
  let leftNode: MemoryNode

  let rightNode: MemoryNode
  let rightInternalArchivist: AbstractModule
  let rightExternalArchivist: AbstractModule
  let rightWitness: AbstractModule

  beforeAll(async () => {
    primaryNode = await MemoryNode.create({ config: { name: 'primaryNode', schema: NodeConfigSchema } })
    primaryArchivist = await MemoryArchivist.create({ config: { name: 'primaryArchivist', schema: MemoryArchivistConfigSchema } })
    await primaryNode.register(primaryArchivist)
    await primaryNode.attach(primaryArchivist.address, true)

    rightNode = await MemoryNode.create({ config: { name: 'rightNode', schema: NodeConfigSchema } })
    rightInternalArchivist = await MemoryArchivist.create({ config: { name: 'rightInternalArchivist', schema: MemoryArchivistConfigSchema } })
    rightExternalArchivist = await MemoryArchivist.create({ config: { name: 'archivist', schema: MemoryArchivistConfigSchema } })
    rightWitness = await IdWitness.create({ config: { name: 'rightWitness', salt: 'test', schema: IdWitnessConfigSchema } })
    await rightNode.register(rightInternalArchivist)
    await rightNode.attach(rightInternalArchivist.address)
    await rightNode.register(rightExternalArchivist)
    await rightNode.attach(rightExternalArchivist.address, true)
    await rightNode.register(rightWitness)
    await rightNode.attach(rightWitness.address, true)

    leftNode = await MemoryNode.create({ config: { name: 'leftNode', schema: NodeConfigSchema } })
    leftInternalArchivist = await MemoryArchivist.create({ config: { name: 'leftInternalArchivist', schema: MemoryArchivistConfigSchema } })
    leftInternalArchivist2 = await MemoryArchivist.create({ config: { name: 'leftInternalArchivist2', schema: MemoryArchivistConfigSchema } })
    leftExternalArchivist = await MemoryArchivist.create({ config: { name: 'archivist', schema: MemoryArchivistConfigSchema } })
    leftDiviner = await AddressHistoryDiviner.create({
      config: { address: leftNode.address, name: 'leftDiviner', schema: AddressHistoryDivinerConfigSchema },
    })
    await leftNode.register(leftInternalArchivist)
    await leftNode.attach(leftInternalArchivist.address)
    await leftNode.register(leftInternalArchivist2)
    await leftNode.attach(leftInternalArchivist2.address)
    await leftNode.register(leftExternalArchivist)
    await leftNode.attach(leftExternalArchivist.address, true)
    await leftNode.register(leftDiviner)
    await leftNode.attach(leftDiviner.address, true)

    await primaryNode.register(leftNode)
    await primaryNode.register(rightNode)
  })
  test('leftNode', async () => {
    const primaryNodeWrapper = NodeWrapper.wrap(primaryNode)
    const leftNodeWrapper = NodeWrapper.wrap(leftNode)
    const rightNodeWrapper = NodeWrapper.wrap(rightNode)

    const leftInternalArchivist2Wrapper = ArchivistWrapper.wrap(leftInternalArchivist2)

    await primaryNode.attach(leftNode.address, true)
    await primaryNode.detach(rightNode.address)
    expect((await primaryNodeWrapper.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ name: ['primaryArchivist'] })).length).toBe(1)

    expect((await leftNodeWrapper.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await leftNodeWrapper.resolve({ name: ['leftDiviner'] })).length).toBe(1)

    // internal: should be resolvable by leftNode children
    expect((await leftInternalArchivist2Wrapper.resolve({ address: [leftInternalArchivist.address] })).length).toBe(1)
    expect((await leftInternalArchivist2Wrapper.resolve({ name: ['leftInternalArchivist'] })).length).toBe(1)

    expect((await leftInternalArchivist2Wrapper.resolve({ address: [leftExternalArchivist.address] })).length).toBe(1)
    expect((await leftInternalArchivist2Wrapper.resolve({ name: ['archivist'] })).length).toBe(1)

    expect((await leftInternalArchivist2Wrapper.resolve({ address: [rightWitness.address] })).length).toBe(0)
    expect((await leftInternalArchivist2Wrapper.resolve({ name: ['rightWitness'] })).length).toBe(0)

    // internal: should not be resolvable by anyone outside of node, including wrapper

    expect((await rightNode.downResolver.resolve({ address: [rightInternalArchivist.address] })).length).toBe(0)
    expect((await rightNode.downResolver.resolve({ name: ['rightInternalArchivist'] })).length).toBe(0)

    expect((await rightNodeWrapper.resolve({ address: [rightInternalArchivist.address] })).length).toBe(0)
    expect((await rightNodeWrapper.resolve({ name: ['rightInternalArchivist'] })).length).toBe(0)

    expect((await rightNodeWrapper.resolve({ address: [rightExternalArchivist.address] })).length).toBe(1)
    expect((await rightNodeWrapper.resolve({ name: ['archivist'] })).length).toBe(1)

    expect((await primaryNodeWrapper.resolve({ address: [leftNode.address] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ name: ['leftNode'] })).length).toBe(1)

    expect((await primaryNodeWrapper.resolve({ address: [rightNode.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['rightNode'] })).length).toBe(0)

    expect((await primaryNodeWrapper.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ name: ['leftDiviner'] })).length).toBe(1)

    expect((await primaryNodeWrapper.resolve({ address: [rightWitness.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['rightWitness'] })).length).toBe(0)

    // internal: should NOT be resolvable by primaryNode
    expect((await primaryNodeWrapper.resolve({ address: [leftInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['leftInternalArchivist'] })).length).toBe(0)

    // internal: should NOT be resolvable by node
    expect((await primaryNodeWrapper.resolve({ address: [rightInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['rightInternalArchivist'] })).length).toBe(0)

    // external: should be resolvable by primaryNode
    expect((await primaryNodeWrapper.resolve({ address: [leftExternalArchivist.address] })).length).toBe(1)

    // external: should be NOT be resolvable by node
    expect((await primaryNodeWrapper.resolve({ address: [rightExternalArchivist.address] })).length).toBe(0)

    // external: should be resolvable by node
    expect((await primaryNodeWrapper.resolve({ name: ['archivist'] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ name: ['archivist'] }))[0].address).toBe(leftExternalArchivist.address)
  })

  test('rightNode', async () => {
    const primaryNodeWrapper = NodeWrapper.wrap(primaryNode)
    const leftNodeWrapper = NodeWrapper.wrap(leftNode)
    const rightNodeWrapper = NodeWrapper.wrap(rightNode)

    await primaryNode.attach(rightNode.address, true)
    await primaryNode.detach(leftNode.address)
    expect((await primaryNodeWrapper.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await leftNodeWrapper.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await rightNodeWrapper.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ address: [rightNode.address] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ address: [leftNode.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ address: [leftDiviner.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['archivist'] })).length).toBe(1)
    expect((await primaryNodeWrapper.resolve({ name: ['archivist'] }))[0].address).toBe(rightExternalArchivist.address)
  })

  test('leftNode', async () => {
    const primaryNodeWrapper = NodeWrapper.wrap(primaryNode)

    await primaryNode.detach(leftNode.address)
    await primaryNode.detach(rightNode.address)
    await primaryNode.attach(leftNode.address, true)
    await primaryNode.attach(rightNode.address, true)

    // internal: should NOT be resolvable by primaryNode
    expect((await primaryNodeWrapper.resolve({ address: [leftInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['leftInternalArchivist'] })).length).toBe(0)

    // internal: should NOT be resolvable by node
    expect((await primaryNodeWrapper.resolve({ address: [rightInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNodeWrapper.resolve({ name: ['rightInternalArchivist'] })).length).toBe(0)

    // external: should be resolvable by primaryNode
    expect((await primaryNodeWrapper.resolve({ address: [leftExternalArchivist.address] })).length).toBe(1)

    // external: should be resolvable by node
    expect((await primaryNodeWrapper.resolve({ address: [rightExternalArchivist.address] })).length).toBe(1)

    // external: should be resolvable by node
    expect((await primaryNodeWrapper.resolve({ name: ['archivist'] })).length).toBe(2)
  })
})
