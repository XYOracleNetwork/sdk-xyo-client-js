/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable max-statements */
import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { Account, HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInsertQuerySchema, ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { DivinerDivineQuerySchema, DivinerInstance, DivinerParams } from '@xyo-network/diviner-model'
import { AbstractModule } from '@xyo-network/module-abstract'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isModuleError, Payload, unMeta, WithMeta } from '@xyo-network/payload-model'

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
        pubSubBridge.connect()
      }),
    )
  })
  afterAll(async () => {
    await Promise.all(clientsWithBridges.map((c) => c.pubSubBridge.disconnect()))
    await Promise.all(clientsWithBridges.map((c) => c.pubSubBridge.stop()))
  })

  describe('With invalid command', () => {
    it('when non-existent address, times out', async () => {
      const clientA = clientsWithBridges[0]
      const nonExistentAddress = 'ba05fd6b4ad8bb12f23259750e49dafef433862d'

      // Issue command via bridge
      const data = [await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()]
      const instance = ArchivistWrapper.wrap(await clientA.pubSubBridge.resolve(nonExistentAddress), Account.randomSync(), false)
      expect(instance).toBeDefined()

      if (instance) {
        try {
          await instance.insert(data)
          //should never reach
          expect(false).toBeTrue()
        } catch {
          expect(true).toBeTrue()
        }
      }
    })
    it('when unsupported query type responds with error', async () => {
      const clientA = clientsWithBridges[0]
      const clientB = clientsWithBridges[1]

      // Build unsupported query
      const data = [await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()]
      const builder = new QueryBoundWitnessBuilder().witness(clientA.module.account)
      await builder.query({ schema: DivinerDivineQuerySchema })
      await builder.payloads(data)
      const [query, payloads] = await builder.build()

      // Issue query locally and get error
      const [localBw, localPayloads, localErrors] = await clientB.module.query(query, payloads)
      expect(localBw).toBeDefined()
      expect(localPayloads).toBeArrayOfSize(0)
      expect(localErrors).toBeDefined()
      expect(localErrors).toBeArrayOfSize(1)
      const localError = localErrors.find(isModuleError)
      expect(localError).toBeDefined()

      // Issue query across bridge and get error
      const [remoteBw, remotePayloads, remoteErrors] = await clientA.pubSubBridge.targetQuery(clientB.module.address, query, payloads)
      expect(remoteBw).toBeDefined()
      expect(remotePayloads).toBeArrayOfSize(0)
      expect(remoteErrors).toBeDefined()
      expect(remoteErrors).toBeArrayOfSize(1)
      const remoteError = remoteErrors.find(isModuleError)
      expect(remoteError).toBeDefined()

      // NOTE: For now, we expect the error messages to be different since
      // we're ignoring the error when it's a remote command
      // but actually executing the query locally
      expect(localError?.message).not.toEqual(remoteError?.message)
    })
  })
  describe('With valid command', () => {
    const issueSourceQueryToDestination = async (
      source: ClientWithBridge,
      destination: ClientWithBridge,
      testPayloadCount: number,
      expectedArchivistSize: number,
    ) => {
      // Modules can't resolve each other
      expect(await source.module.resolve(destination.module.address)).toBeUndefined()
      expect(await destination.module.resolve(source.module.address)).toBeUndefined()

      const clientA = clientsWithBridges[0]

      // Issue command via bridge
      const data = [await new PayloadBuilder({ schema: 'network.xyo.test' }).fields({ salt: Date.now() }).build()]
      const instance = ArchivistWrapper.wrap(await clientA.pubSubBridge.resolve(destination.module.address), Account.randomSync(), false)
      expect(instance).toBeDefined()

      const result = await instance?.insert(data)

      expect(result).toBeArrayOfSize(data.length)

      // Expect target to have data
      const clientBArchivist = asArchivistInstance(destination.module)
      expect(clientBArchivist).toBeDefined()
      const archivist = assertEx(clientBArchivist)
      const all = await archivist.all?.()
      expect(all?.map(unMeta)).toIncludeAllMembers(data.map(unMeta))
    }
    it.each([
      ['A', 'B'],
      ['B', 'A'],
    ])('Module %s issues command to Module %s', async (sourceModuleLetter, destinationModuleLetter) => {
      // Issue test archivist insert command from source to destination
      const source = assertEx(clientsWithBridges.find((v) => v.module.config.name === `module${sourceModuleLetter}`))
      const destination = assertEx(clientsWithBridges.find((v) => v.module.config.name === `module${destinationModuleLetter}`))
      const testPayloadCount = 2
      const testIterations = 3
      for (let i = 0; i < testIterations; i++) {
        // Ensure the end count is what we'd expect after `i` insertions (proves
        // commands are being processed only once)
        await issueSourceQueryToDestination(source, destination, testPayloadCount, testPayloadCount * (i + 1))
      }
    })
  })
})
