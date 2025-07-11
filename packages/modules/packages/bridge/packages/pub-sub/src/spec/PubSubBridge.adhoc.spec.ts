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

    const hostBridge = await PubSubBridge.create({
      account: 'random',
      config: {
        host: {
          intersect, pollFrequency, stateStore,
        },
        name: 'hostPubSubBridge',
        schema: PubSubBridge.defaultConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    const clientBridge = await PubSubBridge.create({
      account: 'random',
      config: {
        client: {
          intersect,
          pollFrequency,
          queryCache: { ttl },
          stateStore,
        },
        name: 'clientPubSubBridge',
        schema: PubSubBridge.defaultConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    clientBridge.on('querySendStarted', ({ query }) => console.log(`Query send started: ${query}`))
    clientBridge.on('querySendFinished', ({ query }) => console.log(`Query send finished: ${query}`))

    hostBridge.on('queryFulfillStarted', ({ query }) => console.log(`Query fulfill started: ${query}`))
    hostBridge.on('queryFulfillFinished', ({ query }) => console.log(`Query fulfill finished: ${query}`))

    clientBridge.onAny(event => console.log(`onAny: ${String(event)}`))

    await clientBridge?.start?.()
    await hostBridge?.start?.()
    await clientNode.register(clientBridge)
    await clientNode.attach(clientBridge?.address, true)
    const resolvedBridge = clientNode.resolve(clientBridge.id)
    expect(resolvedBridge).toBeDefined()

    await hostNode.register(hostBridge)
    await hostNode.attach(hostBridge?.address, true)
    await hostBridge.expose(hostNodeContainer.address, { maxDepth: 5 })

    const exposed = await hostBridge.exposed?.()
    expect(exposed).toBeArray()
    expect(exposed?.length).toBeGreaterThan(1)

    // test the requirement for connect to be called before resolve
    const rootModuleNoExist = await clientNode.resolve(hostNodeContainer.address)
    expect(rootModuleNoExist).toBeUndefined()

    const connectedAddress = await clientBridge.connect(hostNodeContainer.address)
    expect(connectedAddress).toBe(hostNodeContainer.address)

    const rootModule = await clientBridge.resolve(hostNodeContainer.address)
    expect(rootModule).toBeDefined()

    const remoteNode = asNodeInstance(rootModule, 'Failed to resolve correct object type')
    expect(remoteNode).toBeDefined()

    const hostNodeContainerByAddress = await clientBridge.resolve(hostNodeContainer.address)
    expect(hostNodeContainerByAddress).toBeDefined()

    const archivistViaHostNodeContainer = await hostNodeContainerByAddress?.resolve('Archivist')
    expect(archivistViaHostNodeContainer).toBeDefined()

    const archivistByName = await hostNodeContainerByAddress?.resolve('Archivist')
    expect(archivistByName).toBeDefined()

    const archivistInstance = asArchivistInstance(archivistByName, 'Failed to cast archivist', { required: true })
    expect(archivistInstance).toBeDefined()
    const knownPayload = PayloadWrapper.parse({ schema: 'network.xyo.test' })?.payload as Payload
    expect(knownPayload).toBeDefined()
    const knownHash = await PayloadBuilder.dataHash(knownPayload as Payload)
    const insertResult = await archivistInstance.insert([knownPayload])
    expect(insertResult).toBeDefined()
    const roundTripPayload = (await archivistInstance.get([knownHash]))[0]
    expect(roundTripPayload).toBeDefined()

    await hostBridge.unexpose(hostNodeContainer.address)
    const exposedAfter = await hostBridge.exposed?.()
    expect(exposedAfter).toBeArray()
    expect(exposedAfter?.length).toBe(0)
  })
}, 10_000)
