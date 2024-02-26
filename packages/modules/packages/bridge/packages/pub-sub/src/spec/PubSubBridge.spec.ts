/* eslint-disable sort-keys-fix/sort-keys-fix */

import { Account, HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance, DivinerParams } from '@xyo-network/diviner-model'
import { AbstractModule } from '@xyo-network/module-abstract'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload } from '@xyo-network/payload-model'

import { AsyncQueryBusIntersectConfig, SearchableStorage } from '../AsyncQueryBus'
import { PubSubBridge } from '../PubSubBridge'

interface IntermediateNode {
  node: MemoryNode
  queryArchivist: ArchivistInstance
  queryBoundWitnessDiviner: DivinerInstance<DivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>
  responseArchivist: ArchivistInstance
  responseBoundWitnessDiviner: DivinerInstance<DivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>
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

const useDebugLogging = false
const logger =
  useDebugLogging ?
    {
      debug: console.debug,
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
describe('PubSubBridge', () => {
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
      await node.attach(mod.address, true)
    }

    const clients = await Promise.all(
      Object.entries(clientNodePhrases).map(async ([name, phrase]) => {
        const clientNodeAccount = await HDWallet.fromPhrase(phrase)
        const node = await MemoryNode.create({
          account: clientNodeAccount,
          config: { name: `node${name}`, schema: MemoryNode.configSchema },
        })

        const stateStoreArchivistAccount = Account.randomSync()
        const stateStoreArchivist = await MemoryArchivist.create({
          account: stateStoreArchivistAccount,
          config: { name: `stateStoreArchivist${name}`, schema: MemoryArchivist.configSchema },
        })

        const stateStoreBoundWitnessDivinerAccount = Account.randomSync()
        const stateStoreBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
          account: stateStoreBoundWitnessDivinerAccount,
          config: {
            archivist: stateStoreArchivist.address,
            name: `stateStoreBoundWitnessDiviner${name}`,
            schema: MemoryBoundWitnessDiviner.configSchema,
          },
        })

        const moduleAccount = Account.randomSync()
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
        const account = await HDWallet.fromPhrase(phrase)
        const stateStore: SearchableStorage = {
          archivist: client.stateStoreArchivist.address,
          boundWitnessDiviner: client.stateStoreBoundWitnessDiviner.address,
        }
        const intersect: AsyncQueryBusIntersectConfig = {
          queries: {
            archivist: intermediateNode.queryArchivist.address,
            boundWitnessDiviner: intermediateNode.queryBoundWitnessDiviner.address,
          },
          responses: {
            archivist: intermediateNode.responseArchivist.address,
            boundWitnessDiviner: intermediateNode.responseBoundWitnessDiviner.address,
          },
        }
        const pubSubBridge: PubSubBridge = await PubSubBridge.create({
          account,
          config: {
            host: { listeningModules: [client.module.address], pollFrequency, intersect, stateStore },
            name: `pubSubBridge${name}`,
            client: {
              pollFrequency,
              intersect,
              queryCache: {
                ttl,
              },
              stateStore,
            },
            schema: PubSubBridge.configSchema,
          },
          logger,
        })
        await node.register(pubSubBridge)
        await node.attach(pubSubBridge.address, false)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clientsWithBridges.push({ ...client, pubSubBridge } as any)
        await node.register(intermediateNode.node)
        await node.attach(intermediateNode.node.address, false)
      }),
    )
  })
  afterAll(async () => {
    await Promise.all(clientsWithBridges.map((c) => c.pubSubBridge.stop()))
  })
  describe('client test', () => {
    it('simple insert', async () => {
      const proxy = await clientsWithBridges[0].pubSubBridge.resolve(clientsWithBridges[1].module.address)
      expect(proxy).toBeDefined()
      if (proxy) {
        await proxy.start?.()
        const wrapper = ArchivistWrapper.wrap(proxy as ArchivistInstance, Account.randomSync())
        const stateResult = await proxy.state()
        //console.log(`state: ${JSON.stringify(stateResult, null, 2)}`)
        expect(stateResult.length).toBeGreaterThan(1)
        const payload: Payload<{ schema: 'network.xyo.test'; value: number }> = { schema: 'network.xyo.test', value: 1 }
        const result = await wrapper.insert([payload])
        expect(result).toBeArrayOfSize(1)
      }
    })
  })
})
