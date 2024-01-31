import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInsertQuerySchema, ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AbstractModule } from '@xyo-network/module-abstract'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { PubSubBridge } from '../PubSubBridge'

interface IntermediateNode {
  commandArchivist: ArchivistInstance
  commandArchivistBoundWitnessDiviner: DivinerInstance
  node: MemoryNode
  queryResponseArchivist: ArchivistInstance
  queryResponseArchivistBoundWitnessDiviner: DivinerInstance
}

interface Client {
  bridgeQueryResponseArchivist: ArchivistInstance
  commandStateStoreArchivist: ArchivistInstance
  module: AbstractModule
  node: MemoryNode
}
interface ClientWithBridge extends Client {
  pubSubBridge: PubSubBridge
}

/**
 * @group module
 * @group bridge
 */

describe('PubSubBridge.caching', () => {
  let intermediateNode: IntermediateNode
  const clientsWithBridges: ClientWithBridge[] = []
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
      node,
      queryResponseArchivist,
      queryResponseArchivistBoundWitnessDiviner,
    }

    for (const mod of Object.values(intermediateNode).filter((v) => v.address !== node.address)) {
      await node.register(mod)
      await node.attach(mod.address, false)
    }

    const clients = await Promise.all(
      ['A', 'B'].map(async (name) => {
        const clientNodeAccount = await Account.create()
        const node = await MemoryNode.create({ account: clientNodeAccount })

        const commandStateStoreArchivistAccount = await Account.create()
        const commandStateStoreArchivist = await MemoryArchivist.create({
          account: commandStateStoreArchivistAccount,
          config: { name: `commandStateStoreArchivist${name}`, schema: MemoryArchivist.configSchema },
        })

        const bridgeQueryResponseArchivistAccount = await Account.create()
        const bridgeQueryResponseArchivist = await MemoryArchivist.create({
          account: bridgeQueryResponseArchivistAccount,
          config: { name: `bridgeQueryResponseArchivist${name}`, schema: MemoryArchivist.configSchema },
        })

        const moduleAccount = await Account.create()
        const module = await MemoryArchivist.create({
          account: moduleAccount,
          config: { name: `module${name}`, schema: MemoryArchivist.configSchema },
        })

        const client = { bridgeQueryResponseArchivist, commandStateStoreArchivist, module, node }
        for (const mod of [bridgeQueryResponseArchivist, commandStateStoreArchivist, module]) {
          await node.register(mod)
          await node.attach(mod.address, false)
        }
        return client
      }),
    )
    for (const client of clients) {
      const node = client.node
      const otherNodeAddress = assertEx(clients.find((c) => c.node.address !== node.address)).node.address
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
          rootAddress: otherNodeAddress,
          schema: PubSubBridge.configSchema,
        },
      })
      await node.register(pubSubBridge)
      await node.attach(pubSubBridge.address, false)
      clientsWithBridges.push({ ...client, pubSubBridge })
      await intermediateNode.node.register(node)
      await intermediateNode.node.attach(node.address, false)
      await pubSubBridge.connect()
    }
  })

  it('Debug test', async () => {
    const clientA = clientsWithBridges[0]
    const clientB = clientsWithBridges[1]
    // Modules can't resolve each other
    expect(await clientA.module.resolve(clientB.module.address)).toBeUndefined()
    expect(await clientB.module.resolve(clientA.module.address)).toBeUndefined()
    const payloads = [await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()]
    const builder = new QueryBoundWitnessBuilder()
    await builder.query({ schema: ArchivistInsertQuerySchema })
    await builder.payloads(payloads)
    const [query] = await builder.build()
    const result = await clientA.pubSubBridge.targetQuery(clientB.module.address, query, payloads)
    expect(result).toBeDefined()
  })
  it.skip('Module A issues command to Module B', async () => {
    const clientA = clientsWithBridges[0]
    const clientB = clientsWithBridges[1]
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
