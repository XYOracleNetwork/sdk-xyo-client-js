/* eslint-disable max-statements */
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
  node: MemoryNode
  queryArchivist: ArchivistInstance
  queryBoundWitnessDiviner: DivinerInstance
  responseArchivist: ArchivistInstance
  responseBoundWitnessDiviner: DivinerInstance
}

interface Client {
  module: AbstractModule
  node: MemoryNode
  stateStoreArchivist: ArchivistInstance
  stateStoreBoundWitnessDiviner: DivinerInstance
}
interface ClientWithBridge extends Client {
  pubSubBridge: PubSubBridge
}

const useDebugLogging = true
const logger = useDebugLogging
  ? {
      debug: console.debug,
      // debug: () => {},
      error: console.error,
      info: console.info,
      log: console.log,
      warn: console.warn,
    }
  : undefined

const pollFrequency = 250
const ttl = 1000 * 5

const clientNodePhrases = {
  A: 'drastic govern leisure pair merit property lava lab equal invest black beach dad glory action',
  B: 'recycle flower copper kiwi want plate hint shoot shift maze symptom scheme bless moon carry',
}
const bridgePhrases = {
  A: 'wait three forget tomato spike return raise oppose tuition useful purity begin noise empty report',
  B: 'donate pluck consider cause tired sail road leopard mammal two board mobile logic wrist make',
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
    const node = await MemoryNode.create({ account: intermediateNodeAccount, config: { name: 'rootNode', schema: MemoryNode.configSchema } })

    const queryArchivistAccount = await Account.create()
    const queryArchivist = await MemoryArchivist.create({
      account: queryArchivistAccount,
      config: { name: 'queryArchivist', schema: MemoryArchivist.configSchema },
    })

    const queryBoundWitnessDivinerAccount = await Account.create()
    const queryBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: queryBoundWitnessDivinerAccount,
      config: { archivist: queryArchivist.address, name: 'queryBoundWitnessDiviner', schema: MemoryBoundWitnessDiviner.configSchema },
    })

    const responseArchivistAccount = await Account.create()
    const responseArchivist = await MemoryArchivist.create({
      account: responseArchivistAccount,
      config: { name: 'responseArchivist', schema: MemoryArchivist.configSchema },
    })

    const responseBoundWitnessDivinerAccount = await Account.create()
    const responseBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      account: responseBoundWitnessDivinerAccount,
      config: { archivist: responseArchivist.address, name: 'responseBoundWitnessDiviner', schema: MemoryBoundWitnessDiviner.configSchema },
    })

    intermediateNode = { node, queryArchivist, queryBoundWitnessDiviner, responseArchivist, responseBoundWitnessDiviner }

    for (const mod of Object.values(intermediateNode).filter((v) => v.address !== node.address)) {
      await node.register(mod)
      await node.attach(mod.address, false)
    }

    const clients = await Promise.all(
      Object.entries(clientNodePhrases).map(async ([name, phrase]) => {
        const clientNodeAccount = await HDWallet.fromPhrase(phrase)
        const node = await MemoryNode.create({
          account: clientNodeAccount,
          config: { name: `node${name}`, schema: MemoryNode.configSchema },
        })

        const stateStoreArchivistAccount = await Account.create()
        const stateStoreArchivist = await MemoryArchivist.create({
          account: stateStoreArchivistAccount,
          config: { name: `stateStoreArchivist${name}`, schema: MemoryArchivist.configSchema },
        })

        const stateStoreBoundWitnessDivinerAccount = await Account.create()
        const stateStoreBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
          account: stateStoreBoundWitnessDivinerAccount,
          config: {
            archivist: stateStoreArchivist.address,
            name: `stateStoreBoundWitnessDiviner${name}`,
            schema: MemoryBoundWitnessDiviner.configSchema,
          },
        })

        const moduleAccount = await Account.create()
        const module = await MemoryArchivist.create({
          account: moduleAccount,
          config: { name: `module${name}`, schema: MemoryArchivist.configSchema },
        })

        const client = { module, node, stateStoreArchivist, stateStoreBoundWitnessDiviner }
        for (const mod of [stateStoreArchivist, stateStoreBoundWitnessDiviner, module]) {
          await node.register(mod)
          await node.attach(mod.address, false)
        }
        return client
      }),
    )

    await Promise.all(
      Object.entries(bridgePhrases).map(async ([name, phrase], i) => {
        const client = clients[i]
        const node = client.node
        const otherNodeAddress = assertEx(clients.find((c) => c.node.address !== node.address)).node.address
        const account = await HDWallet.fromPhrase(phrase)
        const pubSubBridge: PubSubBridge = await PubSubBridge.create({
          account,
          config: {
            name: `pubSubBridge${name}`,
            pollFrequency,
            queries: {
              archivist: intermediateNode.queryArchivist.address,
              boundWitnessDiviner: intermediateNode.queryBoundWitnessDiviner.address,
            },
            queryCache: {
              ttl,
            },
            responses: {
              archivist: intermediateNode.responseArchivist.address,
              boundWitnessDiviner: intermediateNode.responseBoundWitnessDiviner.address,
            },
            rootAddress: otherNodeAddress,
            schema: PubSubBridge.configSchema,
            stateStore: {
              archivist: client.stateStoreArchivist.address,
              boundWitnessDiviner: client.stateStoreBoundWitnessDiviner.address,
            },
          },
          logger,
        })
        await node.register(pubSubBridge)
        await node.attach(pubSubBridge.address, false)
        clientsWithBridges.push({ ...client, pubSubBridge })
        await intermediateNode.node.register(node)
        await intermediateNode.node.attach(node.address, false)
        await pubSubBridge.connect()
      }),
    )
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
