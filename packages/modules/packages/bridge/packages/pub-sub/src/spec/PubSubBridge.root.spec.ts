/* eslint-disable max-statements */
import '@xylabs/vitest-extended'

import { ConsoleLogger, LogLevel } from '@xylabs/logger'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema, asArchivistInstance } from '@xyo-network/archivist-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import type { SearchableStorage } from '@xyo-network/diviner-model'
import { AbstractModule } from '@xyo-network/module-abstract'
import { MemoryNode } from '@xyo-network/node-memory'
import { asNodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  describe, expect, it,
} from 'vitest'

import type { AsyncQueryBusIntersectConfig } from '../AsyncQueryBus/index.ts'
import { PubSubBridge } from '../PubSubBridge.ts'

/**
 * @group module
 * @group bridge
 */

AbstractModule.defaultLogger = new ConsoleLogger(LogLevel.warn)

const pollFrequency = 250
const ttl = 1000 * 5

describe('PubSubBridge', () => {
  it('PubSubBridge', async () => {
    const intermediateNodeAccount = await Account.create()
    const intermediateNode = await MemoryNode.create({
      account: intermediateNodeAccount,
      config: { name: 'intermediateNode', schema: MemoryNode.defaultConfigSchema },
    })

    const hostNode = await MemoryNode.create({
      account: 'random',
      config: { name: 'hostNode', schema: MemoryNode.defaultConfigSchema },
    })

    const hostNodeContainer = await MemoryNode.create({
      account: 'random',
      config: { name: 'hostNodeContainer', schema: MemoryNode.defaultConfigSchema },
    })

    const archivist = await MemoryArchivist.create({
      account: 'random',
      config: { name: 'Archivist', schema: ArchivistConfigSchema },
    })

    await hostNodeContainer.register(archivist)
    await hostNodeContainer.attach(archivist.address, true)

    const queryArchivistAccount = await Account.create()
    const queryArchivist = await MemoryArchivist.create({
      account: queryArchivistAccount,
      config: { name: 'queryArchivist', schema: MemoryArchivist.defaultConfigSchema },
    })

    await intermediateNode.register(queryArchivist)
    await intermediateNode.attach(queryArchivist.address, true)

    const queryBoundWitnessDivinerAccount = await Account.create()
    const queryBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: queryBoundWitnessDivinerAccount,
      config: {
        archivist: queryArchivist.address, name: 'queryBoundWitnessDiviner', schema: MemoryBoundWitnessDiviner.defaultConfigSchema,
      },
    })

    await intermediateNode.register(queryBoundWitnessDiviner)
    await intermediateNode.attach(queryBoundWitnessDiviner.address, true)

    const responseArchivistAccount = await Account.create()
    const responseArchivist = await MemoryArchivist.create({
      account: responseArchivistAccount,
      config: { name: 'responseArchivist', schema: MemoryArchivist.defaultConfigSchema },
    })

    await intermediateNode.register(responseArchivist)
    await intermediateNode.attach(responseArchivist.address, true)

    const responseBoundWitnessDivinerAccount = await Account.create()
    const responseBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: responseBoundWitnessDivinerAccount,
      config: {
        archivist: responseArchivist.address, name: 'responseBoundWitnessDiviner', schema: MemoryBoundWitnessDiviner.defaultConfigSchema,
      },
    })

    await intermediateNode.register(responseBoundWitnessDiviner)
    await intermediateNode.attach(responseBoundWitnessDiviner.address, true)

    const clientNode = await MemoryNode.create({ account: 'random' })

    await clientNode.register(intermediateNode)
    await clientNode.attach(intermediateNode.address, true)

    await hostNode.register(intermediateNode)
    await hostNode.attach(intermediateNode.address, true)

    await hostNode.register(hostNodeContainer)
    await hostNode.attach(hostNodeContainer.address, true)

    const stateStoreArchivistAccount = await Account.random()
    const stateStoreArchivist = await MemoryArchivist.create({
      account: stateStoreArchivistAccount,
      config: { name: 'stateStoreArchivist', schema: MemoryArchivist.defaultConfigSchema },
    })

    const stateStoreBoundWitnessDivinerAccount = await Account.random()
    const stateStoreBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: stateStoreBoundWitnessDivinerAccount,
      config: {
        archivist: stateStoreArchivist.address,
        name: 'stateStoreBoundWitnessDiviner',
        schema: MemoryBoundWitnessDiviner.defaultConfigSchema,
      },
    })

    const stateStore: SearchableStorage = {
      archivist: stateStoreArchivist.address,
      boundWitnessDiviner: stateStoreBoundWitnessDiviner.address,
    }
    const intersect: AsyncQueryBusIntersectConfig = {
      queries: {
        archivist: queryArchivist.address,
        boundWitnessDiviner: queryBoundWitnessDiviner.address,
      },
      responses: {
        archivist: responseArchivist.address,
        boundWitnessDiviner: responseBoundWitnessDiviner.address,
      },
    }

    const pubSubBridge = await PubSubBridge.create({
      account: 'random',
      config: {
        client: {
          intersect,
          pollFrequency,
          queryCache: { ttl },
          stateStore,
        },
        discoverRoots: 'lazy',
        host: {
          intersect, pollFrequency, stateStore,
        },
        name: 'pubSubBridge',
        roots: [hostNodeContainer.address],
        schema: PubSubBridge.defaultConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    await clientNode.register(pubSubBridge)
    await clientNode.attach(pubSubBridge?.address, true)
    const resolvedBridge = clientNode.resolve(pubSubBridge.id)
    expect(resolvedBridge).toBeDefined()

    await hostNode.register(pubSubBridge)
    await hostNode.attach(pubSubBridge?.address, true)
    await pubSubBridge.expose(hostNodeContainer.address)

    const exposed = await pubSubBridge.exposed?.()
    expect(exposed).toBeArray()
    expect(exposed?.length).toBeGreaterThan(1)

    const rootModule = await pubSubBridge.resolve(hostNodeContainer.address)
    expect(rootModule).toBeDefined()

    const rootModuleViaHostNode = await hostNode.resolve(hostNodeContainer.address)
    expect(rootModuleViaHostNode).toBeDefined()

    const remoteNode = asNodeInstance(rootModule, 'Failed to resolve correct object type [XYOPublic]')
    expect(remoteNode).toBeDefined()

    const archivistByName = await pubSubBridge.resolve(`${hostNodeContainer.address}:Archivist`)
    expect(archivistByName).toBeDefined()
    const archivistInstance = asArchivistInstance(archivistByName, 'Failed to cast archivist')
    expect(archivistInstance).toBeDefined()
    const knownPayload = PayloadWrapper.parse({ schema: 'network.xyo.test' })?.payload as Payload
    expect(knownPayload).toBeDefined()
    const knownHash = await PayloadBuilder.dataHash(knownPayload as Payload)
    const insertResult = await archivistInstance.insert([knownPayload])
    expect(insertResult).toBeDefined()
    const roundTripPayload = (await archivistInstance.get([knownHash]))[0]
    expect(roundTripPayload).toBeDefined()

    await pubSubBridge.unexpose(hostNodeContainer.address)
    const exposedAfter = await pubSubBridge.exposed?.()
    expect(exposedAfter).toBeArray()
    expect(exposedAfter?.length).toBe(0)
  })
})
