import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistInsertQuery, ArchivistInsertQuerySchema, ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness, isQueryBoundWitness } from '@xyo-network/boundwitness-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AbstractModule } from '@xyo-network/module-abstract'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload, QueryFields } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

interface IntermediateNode {
  commandArchivist: ArchivistInstance
  commandArchivistBoundWitnessDiviner: DivinerInstance
  queryResponseArchivist: ArchivistInstance
  queryResponseArchivistBoundWitnessDiviner: DivinerInstance
}

interface BridgeClient {
  // bridge: BridgeInstance
  bridgeQueryResponseArchivist: ArchivistInstance
  commandStateStoreArchivist: ArchivistInstance
  module: AbstractModule
}

/**
 * @group module
 * @group bridge
 */

describe.skip('HttpBridge.caching', () => {
  let intermediateNode: IntermediateNode
  let clients: BridgeClient[]
  const payload = PayloadWrapper.parse({ salt: Date.now(), schema: 'network.xyo.test' })?.jsonPayload() as Payload
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

        const cachingBridge: BridgeClient = { bridgeQueryResponseArchivist, commandStateStoreArchivist, module }
        for (const mod of Object.values(cachingBridge)) {
          await clientNode.register(mod)
          await clientNode.attach(mod.address, true)
        }
        return cachingBridge
      }),
    )
  })

  it('Module A issues command', async () => {
    const source = clients[0]
    const destination = clients[1]
    const query: ArchivistInsertQuery = { address: destination.module.account.address, schema: ArchivistInsertQuerySchema }
    const [command, payloads] = await new QueryBoundWitnessBuilder().witness(source.module.account).query(query).payloads([payload]).build()
    sourceQueryHash = await PayloadHasher.hashAsync(command)
    const insertResult = await intermediateNode.commandArchivist.insert([command, ...payloads])
    expect(insertResult).toBeDefined()
    expect(insertResult).toBeArrayOfSize(1 + payloads.length)
  })
  it('Module B receives command', async () => {
    const destination = clients[1].module
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
      if (query && query?.address === destination.address && destination.queries.includes(query.schema)) {
        // Issue query against module
        response = await destination.query(command, Object.values(commandPayloads))
        expect(response).toBeDefined()
      }
    }
    const archivist = asArchivistInstance(destination, 'Failed to cast archivist')
    expect(archivist?.all).toBeFunction()
    const all = await archivist.all?.()
    expect(all).toBeArrayOfSize(1)
    expect(all?.[0]).toEqual(payload)
  })
  it('Module B issues response', async () => {
    const { queryResponseArchivist } = intermediateNode
    const [bw, payloads, errors] = response
    const insertResult = await queryResponseArchivist.insert([bw, ...payloads, ...errors])
    expect(insertResult).toBeDefined()
    expect(insertResult).toBeArrayOfSize(1 + payloads.length)
  })
  it('Module A receives response', async () => {
    const destination = clients[1]
    const { queryResponseArchivist, queryResponseArchivistBoundWitnessDiviner } = intermediateNode
    // Attach event handler to archivist insert
    const done = new Promise((resolve, reject) => {
      destination.bridgeQueryResponseArchivist.on('inserted', async (insertResult) => {
        await Promise.resolve()
        const bw = insertResult.payloads.find(isBoundWitness)
        if (bw) {
          // Filter specifically for the sourceQuery for the hash we issued
          if (bw?.sourceQuery === sourceQueryHash) {
            const payloads = insertResult.payloads.filter((payload) => payload !== bw)
            const rematerializedResponse: ModuleQueryResult = [bw, payloads, []]
            resolve(rematerializedResponse)
          }
        } else {
          reject()
        }
      })
    })
    // TODO: Retrieve offset from state store
    const offset = 0
    // Filter BWs specifically for the sourceQuery for the hash we issued to the address we issued it to
    const addresses = [destination.module.address]
    const query = { addresses, limit: 1, offset, schema: BoundWitnessDivinerQuerySchema, sort: 'asc', sourceQuery: sourceQueryHash }
    const queryResponseResults = await queryResponseArchivistBoundWitnessDiviner.divine([query])
    expect(queryResponseResults).toBeArray()
    expect(queryResponseResults.length).toBe(1)
    // TODO: Identity function for isQueryBoundWitnessResponse/ModuleQueryResult
    const queryResponseResult = queryResponseResults.find(isBoundWitness)
    expect(queryResponseResult).toBeDefined()
    const queryResponsePayloadHashes = assertEx(queryResponseResult, 'Failed to get queryResponseHash').payload_hashes
    const queryResponsePayloads = await queryResponseArchivist.get(queryResponsePayloadHashes)
    expect(queryResponsePayloads).toBeArrayOfSize(1)
    // Insert into bridgeQueryResponseArchivist
    await destination.bridgeQueryResponseArchivist.insert([assertEx(queryResponseResult), ...queryResponsePayloads])
    return done
  })
})
