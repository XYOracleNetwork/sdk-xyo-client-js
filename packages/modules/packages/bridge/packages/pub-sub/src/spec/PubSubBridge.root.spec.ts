/* eslint-disable max-statements */
import { ConsoleLogger, LogLevel } from '@xylabs/logger'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistConfigSchema, asArchivistInstance } from '@xyo-network/archivist-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { AbstractModule } from '@xyo-network/module-abstract'
import { MemoryNode } from '@xyo-network/node-memory'
import { asNodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AsyncQueryBusIntersectConfig, SearchableStorage } from '../AsyncQueryBus'
import { PubSubBridge } from '../PubSubBridge'

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
      config: { name: 'intermediateNode', schema: MemoryNode.configSchema },
    })

    const hostNode = await MemoryNode.create({
      account: Account.randomSync(),
      config: { name: 'hostNode', schema: MemoryNode.configSchema },
    })

    const hostNodeContainer = await MemoryNode.create({
      account: Account.randomSync(),
      config: { name: 'hostNodeContainer', schema: MemoryNode.configSchema },
    })

    const archivist = await MemoryArchivist.create({
      account: Account.randomSync(),
      config: { name: 'Archivist', schema: ArchivistConfigSchema },
    })

    await hostNodeContainer.register(archivist)
    await hostNodeContainer.attach(archivist.address, true)

    const queryArchivistAccount = await Account.create()
    const queryArchivist = await MemoryArchivist.create({
      account: queryArchivistAccount,
      config: { name: 'queryArchivist', schema: MemoryArchivist.configSchema },
    })

    await intermediateNode.register(queryArchivist)
    await intermediateNode.attach(queryArchivist.address, true)

    const queryBoundWitnessDivinerAccount = await Account.create()
    const queryBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: queryBoundWitnessDivinerAccount,
      config: { archivist: queryArchivist.address, name: 'queryBoundWitnessDiviner', schema: MemoryBoundWitnessDiviner.configSchema },
    })

    await intermediateNode.register(queryBoundWitnessDiviner)
    await intermediateNode.attach(queryBoundWitnessDiviner.address, true)

    const responseArchivistAccount = await Account.create()
    const responseArchivist = await MemoryArchivist.create({
      account: responseArchivistAccount,
      config: { name: 'responseArchivist', schema: MemoryArchivist.configSchema },
    })

    await intermediateNode.register(responseArchivist)
    await intermediateNode.attach(responseArchivist.address, true)

    const responseBoundWitnessDivinerAccount = await Account.create()
    const responseBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: responseBoundWitnessDivinerAccount,
      config: { archivist: responseArchivist.address, name: 'responseBoundWitnessDiviner', schema: MemoryBoundWitnessDiviner.configSchema },
    })

    await intermediateNode.register(responseBoundWitnessDiviner)
    await intermediateNode.attach(responseBoundWitnessDiviner.address, true)

    const clientNode = await MemoryNode.create({ account: Account.randomSync() })

    await clientNode.register(intermediateNode)
    await clientNode.attach(intermediateNode.address, true)

    await hostNode.register(intermediateNode)
    await hostNode.attach(intermediateNode.address, true)

    await hostNode.register(hostNodeContainer)
    await hostNode.attach(hostNodeContainer.address, true)

    const stateStoreArchivistAccount = Account.randomSync()
    const stateStoreArchivist = await MemoryArchivist.create({
      account: stateStoreArchivistAccount,
      config: { name: 'stateStoreArchivist', schema: MemoryArchivist.configSchema },
    })

    const stateStoreBoundWitnessDivinerAccount = Account.randomSync()
    const stateStoreBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: stateStoreBoundWitnessDivinerAccount,
      config: {
        archivist: stateStoreArchivist.address,
        name: 'stateStoreBoundWitnessDiviner',
        schema: MemoryBoundWitnessDiviner.configSchema,
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

    const bridge = await PubSubBridge.create({
      account: Account.randomSync(),
      config: {
        client: {
          intersect,
          pollFrequency,
          queryCache: {
            ttl,
          },
          stateStore,
        },
        host: { intersect, pollFrequency, stateStore },
        name: 'pubSubBridge',
        roots: [hostNodeContainer.address],
        schema: PubSubBridge.configSchema,
        security: { allowAnonymous: true },
      },
    })

    await bridge?.start?.()
    await clientNode.register(bridge)
    await clientNode.attach(bridge?.address, true)
    const resolvedBridge = clientNode.resolve(bridge.id)
    expect(resolvedBridge).toBeDefined()

    await hostNode.register(bridge)
    await hostNode.attach(bridge?.address, true)
    await bridge.expose(hostNodeContainer.address)

    const exposed = await bridge.exposed?.()
    expect(exposed).toBeArray()
    expect(exposed?.length).toBeGreaterThan(1)

    const rootModule = await bridge.resolve(hostNodeContainer.address)
    expect(rootModule).toBeDefined()

    const remoteNode = asNodeInstance(rootModule, 'Failed to resolve correct object type [XYOPublic]')
    expect(remoteNode).toBeDefined()

    const archivistByName = await bridge.resolve('hostNodeContainer:Archivist')
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

    await bridge.unexpose(hostNodeContainer.address)
    const exposedAfter = await bridge.exposed?.()
    expect(exposedAfter).toBeArray()
    expect(exposedAfter?.length).toBe(0)
  })
})
