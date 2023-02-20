import { MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { MemoryAddressHistoryDiviner, MemoryAddressHistoryDivinerConfigSchema } from '@xyo-network/diviner'
import { IdWitness, IdWitnessConfigSchema } from '@xyo-network/id-plugin'
import { AbstractModule } from '@xyo-network/module'
import { MemoryNode, NodeConfigSchema } from '@xyo-network/node'

describe('MultiNodeConfiguration', () => {
  let primaryArchivist: AbstractModule
  let primaryNode: MemoryNode

  let leftInternalArchivist: AbstractModule
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
    await primaryNode.register(primaryArchivist).attach(primaryArchivist.address, true)

    rightNode = await MemoryNode.create({ config: { name: 'rightNode', schema: NodeConfigSchema } })
    rightInternalArchivist = await MemoryArchivist.create({ config: { name: 'rightInternalArchivist', schema: MemoryArchivistConfigSchema } })
    rightExternalArchivist = await MemoryArchivist.create({ config: { name: 'archivist', schema: MemoryArchivistConfigSchema } })
    rightWitness = await IdWitness.create({ config: { name: 'rightWitness', salt: 'test', schema: IdWitnessConfigSchema } })
    await rightNode.register(rightInternalArchivist).attach(rightInternalArchivist.address)
    await rightNode.register(rightExternalArchivist).attach(rightExternalArchivist.address, true)
    await rightNode.register(rightWitness).attach(rightWitness.address, true)

    leftNode = await MemoryNode.create({ config: { name: 'leftNode', schema: NodeConfigSchema } })
    leftInternalArchivist = await MemoryArchivist.create({ config: { name: 'leftInternalArchivist', schema: MemoryArchivistConfigSchema } })
    leftExternalArchivist = await MemoryArchivist.create({ config: { name: 'archivist', schema: MemoryArchivistConfigSchema } })
    leftDiviner = await MemoryAddressHistoryDiviner.create({
      config: { address: leftNode.address, name: 'leftDiviner', schema: MemoryAddressHistoryDivinerConfigSchema },
    })
    await leftNode.register(leftInternalArchivist).attach(leftInternalArchivist.address)
    await leftNode.register(leftExternalArchivist).attach(leftExternalArchivist.address, true)
    await leftNode.register(leftDiviner).attach(leftDiviner.address, true)

    primaryNode.register(leftNode)
    primaryNode.register(rightNode)
  })
  test('leftNode', async () => {
    await primaryNode.attach(leftNode.address, true)
    primaryNode.detach(rightNode.address)
    expect((await primaryNode.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['primaryArchivist'] })).length).toBe(1)

    expect((await leftNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await leftNode.resolve({ name: ['leftDiviner'] })).length).toBe(1)

    // internal: should be resolvable by leftNode
    expect((await leftNode.resolve({ address: [leftInternalArchivist.address] })).length).toBe(1)
    expect((await leftNode.resolve({ name: ['leftInternalArchivist'] })).length).toBe(1)

    expect((await leftNode.resolve({ address: [leftExternalArchivist.address] })).length).toBe(1)
    expect((await leftNode.resolve({ name: ['archivist'] })).length).toBe(1)

    expect((await rightNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await rightNode.resolve({ name: ['rightWitness'] })).length).toBe(1)

    // internal: should be resolvable by rightNode
    expect((await rightNode.resolve({ address: [rightInternalArchivist.address] })).length).toBe(1)
    expect((await rightNode.resolve({ name: ['rightInternalArchivist'] })).length).toBe(1)

    expect((await rightNode.resolve({ address: [rightExternalArchivist.address] })).length).toBe(1)
    expect((await rightNode.resolve({ name: ['archivist'] })).length).toBe(1)

    expect((await primaryNode.resolve({ address: [leftNode.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['leftNode'] })).length).toBe(1)

    expect((await primaryNode.resolve({ address: [rightNode.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['rightNode'] })).length).toBe(0)

    expect((await primaryNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['leftDiviner'] })).length).toBe(1)

    expect((await primaryNode.resolve({ address: [rightWitness.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['rightWitness'] })).length).toBe(0)

    // internal: should NOT be resolvable by primaryNode
    expect((await primaryNode.resolve({ address: [leftInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['leftInternalArchivist'] })).length).toBe(0)

    // internal: should NOT be resolvable by node
    expect((await primaryNode.resolve({ address: [rightInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['rightInternalArchivist'] })).length).toBe(0)

    // external: should be resolvable by primaryNode
    expect((await primaryNode.resolve({ address: [leftExternalArchivist.address] })).length).toBe(1)

    // external: should be NOT be resolvable by node
    expect((await primaryNode.resolve({ address: [rightExternalArchivist.address] })).length).toBe(0)

    // external: should be resolvable by node
    expect((await primaryNode.resolve({ name: ['archivist'] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['archivist'] }))[0].address).toBe(leftExternalArchivist.address)
  })

  test('rightNode', async () => {
    await primaryNode.attach(rightNode.address, true)
    primaryNode.detach(leftNode.address)
    expect((await primaryNode.resolve({ address: [primaryArchivist.address] })).length).toBe(1)
    expect((await leftNode.resolve({ address: [leftDiviner.address] })).length).toBe(1)
    expect((await rightNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [rightNode.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [leftNode.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ address: [rightWitness.address] })).length).toBe(1)
    expect((await primaryNode.resolve({ address: [leftDiviner.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['archivist'] })).length).toBe(1)
    expect((await primaryNode.resolve({ name: ['archivist'] }))[0].address).toBe(rightExternalArchivist.address)
  })

  test('leftNode', async () => {
    primaryNode.detach(leftNode.address)
    primaryNode.detach(rightNode.address)
    await primaryNode.attach(leftNode.address, true)
    await primaryNode.attach(rightNode.address, true)

    // internal: should NOT be resolvable by primaryNode
    expect((await primaryNode.resolve({ address: [leftInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['leftInternalArchivist'] })).length).toBe(0)

    // internal: should NOT be resolvable by node
    expect((await primaryNode.resolve({ address: [rightInternalArchivist.address] })).length).toBe(0)
    expect((await primaryNode.resolve({ name: ['rightInternalArchivist'] })).length).toBe(0)

    // external: should be resolvable by primaryNode
    expect((await primaryNode.resolve({ address: [leftExternalArchivist.address] })).length).toBe(1)

    // external: should be resolvable by node
    expect((await primaryNode.resolve({ address: [rightExternalArchivist.address] })).length).toBe(1)

    // external: should be resolvable by node
    expect((await primaryNode.resolve({ name: ['archivist'] })).length).toBe(2)
  })
})
