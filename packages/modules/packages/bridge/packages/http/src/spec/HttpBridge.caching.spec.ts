import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import {
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  ArchivistModule,
  asArchivistInstance,
} from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { asDivinerInstance, DivinerInstance } from '@xyo-network/diviner-model'
import { AbstractModule } from '@xyo-network/module/packages/abstract'
import { ModuleInstance } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

interface IntermediateNode {
  commandArchivist: ArchivistInstance
  commandBoundWitnessDiviner: DivinerInstance
}

interface CachingBridge {
  bridge: BridgeInstance
  commandStateStoreArchivist: ArchivistInstance
  module: AbstractModule
  queryResponseArchivist: ArchivistInstance
}

interface BridgeClient {
  cachingBridge: CachingBridge
  intermediateNode: IntermediateNode
  name: string
  node: NodeInstance
}

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge.caching', () => {
  const nodeUrl = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  let clients: BridgeClient[]
  const payload = PayloadWrapper.parse({ salt: Date.now(), schema: 'network.xyo.test' })?.jsonPayload() as Payload
  beforeAll(async () => {
    clients = await Promise.all(
      ['A', 'B'].map(async (name) => {
        const nodeAccount = await Account.create()
        const node = await MemoryNode.create({ account: nodeAccount })

        const commandStateStoreArchivistAccount = await Account.create()
        const commandStateStoreArchivist = await MemoryArchivist.create({
          account: commandStateStoreArchivistAccount,
          config: { schema: MemoryArchivist.configSchema },
        })

        const queryResponseArchivistAccount = await Account.create()
        const queryResponseArchivist = await MemoryArchivist.create({
          account: queryResponseArchivistAccount,
          config: { schema: MemoryArchivist.configSchema },
        })

        const moduleAccount = await Account.create()
        const module = await MemoryArchivist.create({
          account: moduleAccount,
          config: { schema: MemoryArchivist.configSchema },
        })

        // Bridge to shared node
        const bridge = await HttpBridge.create({
          account: Account.randomSync(),
          config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
        })
        await bridge?.start?.()
        const remoteNode = asNodeInstance(
          (await bridge.resolve({ address: [await bridge.getRootAddress()] }))?.pop(),
          `Failed to resolve rootNode [${await bridge.getRootAddress()}]`,
        )
        await node.register(remoteNode)
        await node.attach(remoteNode?.address, true)

        const commandArchivistModule = await node.resolve('Archivist')
        expect(commandArchivistModule).toBeDefined()
        const commandArchivist = asArchivistInstance(commandArchivistModule, 'Failed to cast archivist')
        expect(commandArchivist).toBeDefined()

        const commandBoundWitnessDivinerModule = await node.resolve('BoundWitnessDiviner')
        expect(commandBoundWitnessDivinerModule).toBeDefined()
        const commandBoundWitnessDiviner = asDivinerInstance(commandBoundWitnessDivinerModule, 'Failed to cast diviner')
        expect(commandBoundWitnessDiviner).toBeDefined()
        const intermediateNode: IntermediateNode = { commandArchivist, commandBoundWitnessDiviner }

        const cachingBridge: CachingBridge = { bridge, commandStateStoreArchivist, module, queryResponseArchivist }
        return { cachingBridge, intermediateNode, name, node }
      }),
    )
  })

  it('Module A issues command', async () => {
    const moduleA = clients[0].cachingBridge.module
    const moduleB = clients[1].cachingBridge.module
    const query: ArchivistInsertQuery = { address: moduleB.account.address, schema: ArchivistInsertQuerySchema }
    const [command, payloads] = await new QueryBoundWitnessBuilder().witness(moduleA.account).query(query).payloads([payload]).build()
    const insertResult = await clients[0].intermediateNode.commandArchivist.insert([command, ...payloads])
    expect(insertResult).toBeDefined()
    expect(insertResult).toBeArrayOfSize(1 + payloads.length)
  })
  it.skip('Module A receives response', async () => {
    const foo = await Promise.resolve()
  })
  it.skip('Module A receives command', async () => {
    const foo = await Promise.resolve()
  })
  it.skip('Module A issues response', async () => {
    const foo = await Promise.resolve()
  })
})
