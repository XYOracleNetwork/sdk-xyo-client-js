/* eslint-disable max-statements */
import '@xylabs/vitest-extended'

import { MemoryArchivist } from '@xyo-network/archivist-memory'
import type { AttachableArchivistInstance } from '@xyo-network/archivist-model'
import { AddressHistoryDiviner, AddressHistoryDivinerConfigSchema } from '@xyo-network/diviner-address-history'
import type { AttachableDivinerInstance } from '@xyo-network/diviner-model'
import { MemoryNode } from '@xyo-network/node-memory'
import {
  isNodeInstance, isNodeModule, NodeConfigSchema,
} from '@xyo-network/node-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'
import type { AttachableWitnessInstance } from '@xyo-network/witness-model'
import {
  beforeAll,
  describe, expect, test,
} from 'vitest'

/**
 * @group module
 */

describe('MultiNodeConfiguration', () => {
  let primaryArchivist: AttachableArchivistInstance
  let primaryNode: MemoryNode

  let leftInternalArchivist: AttachableArchivistInstance
  let leftInternalArchivist2: AttachableArchivistInstance
  let leftExternalArchivist: AttachableArchivistInstance
  let leftDiviner: AttachableDivinerInstance
  let leftNode: MemoryNode

  let rightNode: MemoryNode
  let rightInternalArchivist: AttachableArchivistInstance
  let rightExternalArchivist: AttachableArchivistInstance
  let rightWitness: AttachableWitnessInstance

  beforeAll(async () => {
    primaryNode = await MemoryNode.create({ account: 'random', config: { name: 'primaryNode', schema: NodeConfigSchema } })
    expect(isNodeModule(primaryNode)).toBe(true)
    expect(isNodeInstance(primaryNode)).toBe(true)
    primaryArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'primaryArchivist', schema: MemoryArchivist.defaultConfigSchema },
    })
    await primaryNode.register(primaryArchivist)
    await primaryNode.attach(primaryArchivist.address, true)

    rightNode = await MemoryNode.create({ account: 'random', config: { name: 'rightNode', schema: NodeConfigSchema } })
    rightInternalArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'rightInternalArchivist', schema: MemoryArchivist.defaultConfigSchema },
    })
    rightExternalArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'archivist', schema: MemoryArchivist.defaultConfigSchema },
    })
    rightWitness = await AdhocWitness.create({
      account: 'random',
      config: { name: 'rightWitness', schema: AdhocWitnessConfigSchema },
    })
    await rightNode.register(rightInternalArchivist)
    await rightNode.attach(rightInternalArchivist.address)
    await rightNode.register(rightExternalArchivist)
    await rightNode.attach(rightExternalArchivist.address, true)
    await rightNode.register(rightWitness)
    await rightNode.attach(rightWitness.address, true)

    leftNode = await MemoryNode.create({ account: 'random', config: { name: 'leftNode', schema: NodeConfigSchema } })
    leftInternalArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'leftInternalArchivist', schema: MemoryArchivist.defaultConfigSchema },
    })
    leftInternalArchivist2 = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'leftInternalArchivist2', schema: MemoryArchivist.defaultConfigSchema },
    })
    leftExternalArchivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'archivist', schema: MemoryArchivist.defaultConfigSchema },
    })
    leftDiviner = await AddressHistoryDiviner.create({
      account: 'random',
      config: {
        address: leftNode.address, name: 'leftDiviner', schema: AddressHistoryDivinerConfigSchema,
      },
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
    await primaryNode.attach(leftNode.address, true)
    // await primaryNode.detach(rightNode.address)
    expect((await primaryNode.resolve(primaryArchivist.address))).toBeDefined()
    expect((await primaryNode.resolve('primaryArchivist'))).toBeDefined()

    expect((await leftNode.resolve(leftDiviner.address))).toBeDefined()
    expect((await leftNode.resolve('leftDiviner'))).toBeDefined()

    // internal: should be resolvable by leftNode children
    expect((await leftInternalArchivist2.resolve(leftInternalArchivist.address))).toBeDefined()
    expect((await leftInternalArchivist2.resolve('leftInternalArchivist'))).toBeDefined()

    expect((await leftInternalArchivist2.resolve(leftExternalArchivist.address))).toBeDefined()
    expect((await leftInternalArchivist2.resolve('archivist'))).toBeDefined()

    expect((await leftInternalArchivist2.resolve(rightWitness.address))).toBeUndefined()
    expect((await leftInternalArchivist2.resolve('rightWitness'))).toBeUndefined()

    // internal: should not be resolvable by anyone outside of node, including wrapper

    expect((await rightNode.resolve(rightInternalArchivist.address))).toBeUndefined()
    expect((await rightNode.resolve('rightInternalArchivist'))).toBeUndefined()

    expect((await rightNode.resolve(rightInternalArchivist.address))).toBeUndefined()
    expect((await rightNode.resolve('rightInternalArchivist'))).toBeUndefined()

    expect((await rightNode.resolve(rightExternalArchivist.address))).toBeDefined()
    expect((await rightNode.resolve('archivist'))).toBeDefined()

    expect((await primaryNode.resolve(leftNode.address))).toBeDefined()
    expect((await primaryNode.resolve('leftNode'))).toBeDefined()

    expect((await primaryNode.resolve(rightNode.address))).toBeUndefined()
    expect((await primaryNode.resolve('rightNode'))).toBeUndefined()

    expect((await primaryNode.resolve(leftDiviner.address))).toBeDefined()
    expect((await primaryNode.resolve('leftDiviner'))).toBeDefined()

    expect((await primaryNode.resolve(rightWitness.address))).toBeUndefined()
    expect((await primaryNode.resolve('rightWitness'))).toBeUndefined()

    // internal: should NOT be resolvable by primaryNode
    expect((await primaryNode.resolve(leftInternalArchivist.address))).toBeUndefined()
    expect((await primaryNode.resolve('leftInternalArchivist'))).toBeUndefined()

    // internal: should NOT be resolvable by node
    expect((await primaryNode.resolve(rightInternalArchivist.address))).toBeUndefined()
    expect((await primaryNode.resolve('rightInternalArchivist'))).toBeUndefined()

    // external: should be resolvable by primaryNode
    expect((await primaryNode.resolve(leftExternalArchivist.address))).toBeDefined()

    // external: should be NOT be resolvable by node
    expect((await primaryNode.resolve(rightExternalArchivist.address))).toBeUndefined()

    // external: should be resolvable by node
    expect((await primaryNode.resolve('archivist'))).toBeDefined()
    expect((await primaryNode.resolve('archivist'))?.address).toBe(leftExternalArchivist.address)
  })

  test('rightNode', async () => {
    await primaryNode.attach(rightNode.address, true)
    await primaryNode.detach(leftNode.address)
    expect((await primaryNode.resolve(primaryArchivist.address))).toBeDefined()
    expect((await leftNode.resolve(leftDiviner.address))).toBeDefined()
    expect((await rightNode.resolve(rightWitness.address))).toBeDefined()
    expect((await primaryNode.resolve(rightNode.address))).toBeDefined()
    expect((await primaryNode.resolve(leftNode.address))).toBeDefined()
    expect((await primaryNode.resolve(rightWitness.address))).toBeDefined()
    expect((await primaryNode.resolve(leftDiviner.address))).toBeDefined()
    expect((await primaryNode.resolve('archivist'))).toBeDefined()
  })

  test('leftNode', async () => {
    // await primaryNode.detach(leftNode.address)
    await primaryNode.detach(rightNode.address)
    await primaryNode.attach(leftNode.address, true)
    await primaryNode.attach(rightNode.address, true)

    // internal: should NOT be resolvable by primaryNode
    expect((await primaryNode.resolve(leftInternalArchivist.address))).toBeUndefined()
    expect((await primaryNode.resolve('leftInternalArchivist'))).toBeUndefined()

    // internal: should NOT be resolvable by node
    expect((await primaryNode.resolve(rightInternalArchivist.address))).toBeUndefined()
    expect((await primaryNode.resolve('rightInternalArchivist'))).toBeUndefined()

    // external: should be resolvable by primaryNode
    expect((await primaryNode.resolve(leftExternalArchivist.address))).toBeDefined()

    // external: should be resolvable by node
    expect((await primaryNode.resolve(rightExternalArchivist.address))).toBeDefined()

    // external: should be resolvable by node
    expect((await primaryNode.resolve('archivist'))).toBeDefined()
  })
})
