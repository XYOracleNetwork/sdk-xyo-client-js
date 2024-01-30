import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInsertQuerySchema, ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness, isQueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AbstractModule } from '@xyo-network/module-abstract'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, QueryFields } from '@xyo-network/payload-model'

import { PubSubBridge } from '../Bridge'

interface IntermediateNode {
  commandArchivist: ArchivistInstance
  commandArchivistBoundWitnessDiviner: DivinerInstance
  queryResponseArchivist: ArchivistInstance
  queryResponseArchivistBoundWitnessDiviner: DivinerInstance
}

interface Client {
  bridgeQueryResponseArchivist: ArchivistInstance
  commandStateStoreArchivist: ArchivistInstance
  module: AbstractModule
  pubSubBridge: PubSubBridge
}

/**
 * @group module
 * @group bridge
 */

describe('PubSubBridge.caching', () => {
  let intermediateNode: IntermediateNode
  let clients: Client[]
  let payload: Payload
  let sourceQueryHash: string
  let response: ModuleQueryResult
  beforeAll(async () => {
    const intermediateNodeAccount = await Account.create()
    const node = await MemoryNode.create({ account: intermediateNodeAccount })

    const commandArchivistAccount = await Account.create()
    const commandArchivist = await MemoryArchivist.create({
      account: commandArchivistAccount,
      config: { schema: MemoryArchivist.configSchema },
    })

    const commandArchivistBoundWitnessDivinerAccount = await Account.create()
    const commandArchivistBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: commandArchivistBoundWitnessDivinerAccount,
      config: { archivist: commandArchivist.address, schema: MemoryBoundWitnessDiviner.configSchema },
    })

    const queryResponseArchivistAccount = await Account.create()
    const queryResponseArchivist = await MemoryArchivist.create({
      account: queryResponseArchivistAccount,
      config: { schema: MemoryArchivist.configSchema },
    })

    const queryResponseArchivistBoundWitnessDivinerAccount = await Account.create()
    const queryResponseArchivistBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: queryResponseArchivistBoundWitnessDivinerAccount,
      config: { archivist: queryResponseArchivist.address, schema: MemoryBoundWitnessDiviner.configSchema },
    })

    intermediateNode = {
      commandArchivist,
      commandArchivistBoundWitnessDiviner,
      queryResponseArchivist,
      queryResponseArchivistBoundWitnessDiviner,
    }

    for (const mod of Object.values(intermediateNode)) {
      await node.register(mod)
      await node.attach(mod.address, true)
    }

    clients = await Promise.all(
      ['A', 'B'].map(async () => {
        const clientNodeAccount = await Account.create()
        const clientNode = await MemoryNode.create({ account: clientNodeAccount })

        const commandStateStoreArchivistAccount = await Account.create()
        const commandStateStoreArchivist = await MemoryArchivist.create({
          account: commandStateStoreArchivistAccount,
          config: { schema: MemoryArchivist.configSchema },
        })

        const bridgeQueryResponseArchivistAccount = await Account.create()
        const bridgeQueryResponseArchivist = await MemoryArchivist.create({
          account: bridgeQueryResponseArchivistAccount,
          config: { schema: MemoryArchivist.configSchema },
        })

        const moduleAccount = await Account.create()
        const module = await MemoryArchivist.create({
          account: moduleAccount,
          config: { schema: MemoryArchivist.configSchema },
        })

        const pubSubBridgeAccount = await Account.create()
        const pubSubBridge: PubSubBridge = await PubSubBridge.create({
          account: pubSubBridgeAccount,
          config: { schema: PubSubBridge.configSchema },
        })

        for (const mod of Object.values(pubSubBridge)) {
          await clientNode.register(mod)
          await clientNode.attach(mod.address, true)
        }
        return { bridgeQueryResponseArchivist, commandStateStoreArchivist, module, pubSubBridge }
      }),
    )
  })

  it('Module A issues command to Module B', async () => {
    await Promise.resolve()
    const clientA = clients[0]
    const clientB = clients[1]
    const proxy = asArchivistInstance(await clientA.pubSubBridge.resolve(clientB.module.address))
    const payload = await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()
    const payloadHash = await PayloadHasher.hash(payload)
    const insertResult = await proxy?.insert([payload])
    expect(insertResult).toBeArrayOfSize(1)
    const getResult = await proxy?.get([payloadHash])
    expect(getResult).toBeArrayOfSize(1)
    expect(getResult?.[0]).toEqual(payload)
  })
})
