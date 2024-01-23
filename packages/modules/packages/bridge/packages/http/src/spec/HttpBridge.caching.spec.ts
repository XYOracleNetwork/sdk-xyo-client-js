import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import {
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  asArchivistInstance,
  withArchivistInstance,
} from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness, isQueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance, DivinerDivineQuerySchema, DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AbstractModule } from '@xyo-network/module-abstract'
import { Module, ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asNodeInstance, NodeInstance } from '@xyo-network/node-model'
import { Payload, Query, QueryFields } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

interface IntermediateNode {
  commandArchivist: ArchivistInstance
  commandArchivistBoundWitnessDiviner: DivinerInstance
  queryResponseArchivist: ArchivistInstance
  queryResponseArchivistBoundWitnessDiviner: DivinerInstance
}

interface CachingBridge {
  // bridge: BridgeInstance
  bridgeQueryResponseArchivist: ArchivistInstance
  commandStateStoreArchivist: ArchivistInstance
  module: AbstractModule
}

interface BridgeClient {
  cachingBridge: CachingBridge
  name: string
}

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge.caching', () => {
  // const nodeUrl = `${process.env.API_DOMAIN}` ?? 'http://localhost:8080'
  let intermediateNode: IntermediateNode
  let clients: BridgeClient[]
  const payload = PayloadWrapper.parse({ salt: Date.now(), schema: 'network.xyo.test' })?.jsonPayload() as Payload
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
      ['A', 'B'].map(async (name) => {
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

        // // Bridge to shared node
        // const bridge = await HttpBridge.create({
        //   account: Account.randomSync(),
        //   config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
        // })
        // await bridge?.start?.()
        // const remoteNode = asNodeInstance(
        //   (await bridge.resolve({ address: [await bridge.getRootAddress()] }))?.pop(),
        //   `Failed to resolve rootNode [${await bridge.getRootAddress()}]`,
        // )
        // await node.register(remoteNode)
        // await node.attach(remoteNode?.address, true)

        // const commandArchivistModule = await node.resolve('Archivist')
        // expect(commandArchivistModule).toBeDefined()
        // const commandArchivist = asArchivistInstance(commandArchivistModule, 'Failed to cast archivist')
        // expect(commandArchivist).toBeDefined()

        // const commandArchivistBoundWitnessDivinerModule = await node.resolve('BoundWitnessDiviner')
        // expect(commandArchivistBoundWitnessDivinerModule).toBeDefined()
        // const commandArchivistBoundWitnessDiviner = asDivinerInstance(commandArchivistBoundWitnessDivinerModule, 'Failed to cast diviner')
        // expect(commandArchivistBoundWitnessDiviner).toBeDefined()

        // const queryResponseArchivistModule = await node.resolve('Archivist')
        // expect(queryResponseArchivistModule).toBeDefined()
        // const queryResponseArchivist = asArchivistInstance(queryResponseArchivistModule, 'Failed to cast archivist')
        // expect(queryResponseArchivist).toBeDefined()

        // const queryResponseArchivistBoundWitnessDivinerModule = await node.resolve('BoundWitnessDiviner')
        // expect(queryResponseArchivistBoundWitnessDivinerModule).toBeDefined()
        // const queryResponseArchivistBoundWitnessDiviner = asDivinerInstance(queryResponseArchivistBoundWitnessDivinerModule, 'Failed to cast diviner')
        // expect(queryResponseArchivistBoundWitnessDiviner).toBeDefined()

        const cachingBridge: CachingBridge = { bridgeQueryResponseArchivist, commandStateStoreArchivist, module }
        for (const mod of Object.values(cachingBridge)) {
          await clientNode.register(mod)
          await clientNode.attach(mod.address, true)
        }
        return { cachingBridge, name }
      }),
    )
  })

  it('Module A issues command', async () => {
    const moduleA = clients[0].cachingBridge.module
    const moduleB = clients[1].cachingBridge.module
    const query: ArchivistInsertQuery = { address: moduleB.account.address, schema: ArchivistInsertQuerySchema }
    const [command, payloads] = await new QueryBoundWitnessBuilder().witness(moduleA.account).query(query).payloads([payload]).build()
    const insertResult = await intermediateNode.commandArchivist.insert([command, ...payloads])
    expect(insertResult).toBeDefined()
    expect(insertResult).toBeArrayOfSize(1 + payloads.length)
  })
  it('Module B receives command', async () => {
    const moduleB = clients[1].cachingBridge.module
    const { commandArchivist, commandArchivistBoundWitnessDiviner } = intermediateNode
    // TODO: Retrieve offset from state store
    const offset = 0
    // TODO: Filter for commands to us by address
    const query = { limit: 1, offset, payload_schemas: [ArchivistInsertQuerySchema], schema: BoundWitnessDivinerQuerySchema, sort: 'asc' }
    const commands = await commandArchivistBoundWitnessDiviner.divine([query])
    expect(commands).toBeArray()
    expect(commands.length).toBeGreaterThan(0)
    for (const command of commands.filter(isQueryBoundWitness)) {
      const commandPayloads = await PayloadHasher.toMap(await commandArchivist.get(command.payload_hashes))
      const query = commandPayloads?.[command.query] as Payload<QueryFields>
      if (query && query?.address === moduleB.address && moduleB.queries.includes(query.schema)) {
        // Issue query against module
        response = await moduleB.query(command, Object.values(commandPayloads))
        expect(response).toBeDefined()
      }
    }
    const archivist = asArchivistInstance(moduleB, 'Failed to cast archivist')
    expect(archivist?.all).toBeFunction()
    const all = await archivist.all?.()
    expect(all).toBeArrayOfSize(1)
    expect(all?.[0]).toEqual(payload)
  })
  it('Module B issues response', async () => {
    const [bw, payloads, errors] = response
    const insertResult = await intermediateNode.queryResponseArchivist.insert([bw, ...payloads, ...errors])
    expect(insertResult).toBeDefined()
    expect(insertResult).toBeArrayOfSize(1 + payloads.length)
  })
  it.skip('Module A receives response', async () => {
    const foo = await Promise.resolve()
  })
})
