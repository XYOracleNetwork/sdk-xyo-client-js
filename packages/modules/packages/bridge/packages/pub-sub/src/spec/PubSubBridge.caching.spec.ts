import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AbstractModule } from '@xyo-network/module-abstract'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'

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
          config: {
            queries: {
              archivist: intermediateNode.commandArchivist.address,
              boundWitnessDiviner: intermediateNode.commandArchivistBoundWitnessDiviner.address,
            },
            responses: {
              archivist: intermediateNode.queryResponseArchivist.address,
              boundWitnessDiviner: intermediateNode.queryResponseArchivistBoundWitnessDiviner.address,
            },
            schema: PubSubBridge.configSchema,
          },
        })
        const client = { bridgeQueryResponseArchivist, commandStateStoreArchivist, module, pubSubBridge }
        for (const mod of Object.values(client)) {
          await clientNode.register(mod)
          await clientNode.attach(mod.address, true)
        }
        return client
      }),
    )
  })

  it('Debug test', async () => {
    const clientA = clients[0]
    const clientB = clients[1]
    const destination = asArchivistInstance(await clientA.pubSubBridge.resolve(clientB.module.address))
    expect(destination).toBeDefined()
    const payload = await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()
    const payloadHash = await PayloadHasher.hash(payload)
    const insertResult = await destination?.insert([payload])
    expect(insertResult).toBeArrayOfSize(1)
    const getResult = await destination?.get([payloadHash])
    expect(getResult).toBeArrayOfSize(1)
    expect(getResult?.[0]).toEqual(payload)
  })
  it.skip('Module A issues command to Module B', async () => {
    const clientA = clients[0]
    const clientB = clients[1]
    const destination = asArchivistInstance(await clientA.pubSubBridge.resolve(clientB.module.address))
    expect(destination).toBeDefined()
    const payload = await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()
    const payloadHash = await PayloadHasher.hash(payload)
    const insertResult = await destination?.insert([payload])
    expect(insertResult).toBeArrayOfSize(1)
    const getResult = await destination?.get([payloadHash])
    expect(getResult).toBeArrayOfSize(1)
    expect(getResult?.[0]).toEqual(payload)
  })
})
