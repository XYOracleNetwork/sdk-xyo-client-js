/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable max-statements */
import { Account, HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance, DivinerParams } from '@xyo-network/diviner-model'
import { ModuleInstance } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'

import {
  AsyncQueryBusClient,
  AsyncQueryBusClientConfig,
  AsyncQueryBusHost,
  AsyncQueryBusIntersectConfig,
  AsyncQueryBusModuleProxy,
  SearchableStorage,
} from '../AsyncQueryBus'

interface IntermediateNode {
  node: MemoryNode
  queryArchivist: ArchivistInstance
  queryBoundWitnessDiviner: DivinerInstance<DivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>
  responseArchivist: ArchivistInstance
  responseBoundWitnessDiviner: DivinerInstance<DivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>
}

interface Client {
  module: ModuleInstance
  node: MemoryNode
  stateStoreArchivist: ArchivistInstance
  stateStoreBoundWitnessDiviner: DivinerInstance
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

const clientNodePhrases = {
  A: 'drastic govern leisure pair merit property lava lab equal invest black beach dad glory action',
  B: 'recycle flower copper kiwi want plate hint shoot shift maze symptom scheme bless moon carry',
}

/**
 * @group module
 * @group bridge
 */
describe('BusProxy', () => {
  let host: AsyncQueryBusHost
  let busClient: AsyncQueryBusClient
  let intermediateNode: IntermediateNode
  const clientsWithBridges: Client[] = []
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

    const clients: Client[] = await Promise.all(
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

        const client: Client = { module, node, stateStoreArchivist, stateStoreBoundWitnessDiviner: stateStoreBoundWitnessDiviner as DivinerInstance }
        for (const mod of [stateStoreArchivist, stateStoreBoundWitnessDiviner, module]) {
          await node.register(mod)
          await node.attach(mod.address, true)
        }
        return client
      }),
    )

    const clientInfo = clients[0]
    clientsWithBridges.push(clients[0])

    const intersect: AsyncQueryBusIntersectConfig = {
      queries: { archivist: queryArchivist.address, boundWitnessDiviner: queryBoundWitnessDiviner.address },
      responses: { archivist: responseArchivist.address, boundWitnessDiviner: responseBoundWitnessDiviner.address },
    }

    const clientStateStore: SearchableStorage = {
      archivist: clientInfo.stateStoreArchivist.address,
      boundWitnessDiviner: clientInfo.stateStoreBoundWitnessDiviner.address,
    }

    busClient = new AsyncQueryBusClient({
      resolver: clientInfo.module,
      logger,
      config: {
        pollFrequency,
        intersect,
        stateStore: clientStateStore,
      } satisfies AsyncQueryBusClientConfig,
    })

    const clientNode = clients[0].node

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await clientNode.register(intermediateNode.node)
    await clientNode.attach(intermediateNode.node.address, true)

    //const otherNodeAddress = assertEx(clients.find((c) => c.node.address !== node.address)).node.address
    //const account = await HDWallet.fromPhrase(phrase)

    const hostInfo = clients[1]
    clientsWithBridges.push(clients[1])

    const hostStateStore: SearchableStorage = {
      archivist: clientInfo.stateStoreArchivist.address,
      boundWitnessDiviner: clientInfo.stateStoreBoundWitnessDiviner.address,
    }

    host = new AsyncQueryBusHost({
      resolver: hostInfo.module,
      logger,
      config: {
        pollFrequency,
        intersect,
        stateStore: hostStateStore,
      },
    })

    const hostNode = clients[1].node

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await hostNode.register(intermediateNode.node)
    await hostNode.attach(intermediateNode.node.address, true)
  })
  afterAll(() => {
    host.stop()
  })

  describe('With valid command', () => {
    const issueSourceQueryToDestination = async (source: Client, destination: Client) => {
      // Modules can't resolve each other
      expect(await source.module.resolve(destination.module.address)).toBeUndefined()
      expect(await destination.module.resolve(source.module.address)).toBeUndefined()

      const account = await HDWallet.fromPhrase('drastic govern leisure pair merit property lava lab equal invest black beach dad glory action')
      const proxy = new AsyncQueryBusModuleProxy({ account, moduleAddress: destination.module.address, queries: [], busClient })

      host.start()

      const m = await proxy.manifest()
      expect(m).toBeDefined()

      host.stop()
    }
    it('Module %s issues command to Module %s', async () => {
      // Issue test archivist insert command from source to destination
      const source = clientsWithBridges[0]
      const destination = clientsWithBridges[1]
      const testIterations = 1
      for (let i = 0; i < testIterations; i++) {
        // Ensure the end count is what we'd expect after `i` insertions (proves
        // commands are being processed only once)
        await issueSourceQueryToDestination(source, destination)
      }
    })
  })
})
