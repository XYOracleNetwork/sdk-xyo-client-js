import { assertEx } from '@xylabs/assert'
import { Account, HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInsertQuerySchema, ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AbstractModule } from '@xyo-network/module-abstract'
import { asModule } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isModuleError } from '@xyo-network/payload-model'

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

const useDebugLogging = true
const logger = useDebugLogging
  ? {
      // debug: console.debug,
      debug: () => {},
      error: console.error,
      info: console.info,
      log: console.log,
      warn: console.warn,
    }
  : undefined

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
    const testPhrases = [
      'wait three forget tomato spike return raise oppose tuition useful purity begin noise empty report',
      'donate pluck consider cause tired sail road leopard mammal two board mobile logic wrist make',
    ]
    expect(testPhrases.length).toEqual(clients.length)
    const connections = []
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i]
      const phrase = testPhrases[i]
      const node = client.node
      const otherNodeAddress = assertEx(clients.find((c) => c.node.address !== node.address)).node.address
      const account = await HDWallet.fromPhrase(phrase)
      const pubSubBridge: PubSubBridge = await PubSubBridge.create({
        account,
        config: {
          pollFrequency: 250,
          queries: {
            archivist: intermediateNode.commandArchivist.address,
            boundWitnessDiviner: intermediateNode.commandArchivistBoundWitnessDiviner.address,
          },
          queryCache: {
            ttl: 1000 * 5,
          },
          responses: {
            archivist: intermediateNode.queryResponseArchivist.address,
            boundWitnessDiviner: intermediateNode.queryResponseArchivistBoundWitnessDiviner.address,
          },
          rootAddress: otherNodeAddress,
          schema: PubSubBridge.configSchema,
        },
        logger,
      })
      await node.register(pubSubBridge)
      await node.attach(pubSubBridge.address, false)
      clientsWithBridges.push({ ...client, pubSubBridge })
      await intermediateNode.node.register(node)
      await intermediateNode.node.attach(node.address, false)
      connections.push(pubSubBridge.connect())
    }
    await Promise.all(connections)
  })

  describe('With valid command', () => {
    it.only('Module A issues command to Module B', async () => {
      const clientA = clientsWithBridges[0]
      const clientB = clientsWithBridges[1]
      // Modules can't resolve each other
      expect(await clientA.module.resolve(clientB.module.address)).toBeUndefined()
      expect(await clientB.module.resolve(clientA.module.address)).toBeUndefined()

      // Issue command via bridge
      const data = [await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()]
      const builder = new QueryBoundWitnessBuilder().witness(clientA.module.account)
      await builder.query({ schema: ArchivistInsertQuerySchema })
      await builder.payloads(data)
      const [query, payloads] = await builder.build()
      const result = await clientA.pubSubBridge.targetQuery(clientB.module.address, query, payloads)

      // Expect result to be defined
      expect(result).toBeDefined()

      // Expect target to have data
      const clientBArchivist = asArchivistInstance(clientB.module)
      expect(clientBArchivist).toBeDefined()
      const archivist = assertEx(clientBArchivist)
      const all = await archivist.all?.()
      expect(all).toBeArrayOfSize(1)
      expect(all).toIncludeAllMembers(data)
    })
  })
  describe('With invalid command', () => {
    it('Non-existent address, times out', async () => {
      const clientA = clientsWithBridges[0]
      const nonExistentAddress = 'ba05fd6b4ad8bb12f23259750e49dafef433862d'

      // Issue command via bridge
      const data = [await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()]
      const builder = new QueryBoundWitnessBuilder().witness(clientA.module.account)
      await builder.query({ schema: ArchivistInsertQuerySchema })
      await builder.payloads(data)
      const [query, payloads] = await builder.build()
      const [bw, _, errors] = await clientA.pubSubBridge.targetQuery(nonExistentAddress, query, payloads)

      // Expect result to be defined
      expect(bw).toBeDefined()
      expect(errors).toBeDefined()
      expect(errors).toBeArrayOfSize(1)
      const error = errors.find(isModuleError)
      expect(error).toBeDefined()
    })
    it('Multiple of the "same" command', async () => {
      await Promise.resolve()
    })
    it('Unsupported command', async () => {
      await Promise.resolve()
    })
  })
})
