import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { Archivist, ArchivistInsertQuerySchema, asArchivistModule, WriteArchivist } from '@xyo-network/archivist-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { asBridgeInstance, asBridgeModule, BridgeInstance, BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { creatableModule, ModuleConfig, ModuleEventData, ModuleQueryResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, QueryFields, SchemaFields } from '@xyo-network/payload-model'

import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

const moduleName = 'PubSubBridge'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [PubSubBridgeConfigSchema]

  protected _configQueriesArchivist: string = ''
  protected _configQueriesBoundWitnessDiviner: string = ''
  protected _configQueriesBridge: string = ''
  protected _configResponsesArchivist: string = ''
  protected _configResponsesBoundWitnessDiviner: string = ''
  protected _configResponsesBridge: string = ''

  protected get queryArchivist() {
    return this._configQueriesArchivist
  }
  protected get queryBoundWitnessDiviner() {
    return this._configQueriesBoundWitnessDiviner
  }
  protected get queryBridge() {
    return this._configQueriesBridge
  }
  protected get responseArchivist() {
    return this._configResponsesArchivist
  }
  protected get responseBoundWitnessDiviner() {
    return this._configResponsesBoundWitnessDiviner
  }
  protected get responseBridge() {
    return this._configResponsesBridge
  }

  async connect(): Promise<boolean> {
    const parentConnected = await super.startHandler()
    if (parentConnected) {
      // TODO: Further resolve supporting modules (Archivists, Diviners, etc.)
      const intermediaryModules = [this.queryArchivist, this.queryBoundWitnessDiviner, this.responseArchivist, this.responseBoundWitnessDiviner]
      const resolved = await Promise.all(intermediaryModules.map((address) => this.resolve(address)))
      return this.connected
    } else {
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    await Promise.resolve()
    this.connected = false
    return true
  }

  override getRootAddress(): Promisable<string> {
    throw new Error('Method not implemented.')
  }

  override targetConfig(_address: string): ModuleConfig {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    throw new Error('Method not implemented.')
  }
  override targetDiscover(_address?: string | undefined, _maxDepth?: number | undefined): Promise<Payload[]> {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    throw new Error('Method not implemented.')
  }
  override targetManifest(_address: string, _maxDepth?: number | undefined): Promise<ModuleManifestPayload> {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    throw new Error('Method not implemented.')
  }
  override targetQueries(_address: string): string[] {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    throw new Error('Method not implemented.')
  }
  override async targetQuery(
    address: string,
    query: SchemaFields & object & QueryFields & { schema: string },
    payloads?: Payload[] | undefined,
  ): Promise<ModuleQueryResult> {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    await this.started('throw')

    // const source = clients[0]
    // const destination = clients[1]
    // const query = { _destination: destination, address: destination.module.account.address, schema: ArchivistInsertQuerySchema }
    // const builder = new QueryBoundWitnessBuilder({ destination: [destination.module.account.address] }).witness(source.module.account)
    // await builder.payloads([payload])
    // await builder.query(query)
    // const [command, payloads] = await builder.build()
    // sourceQueryHash = await PayloadBuilder.dataHash(command)
    // const insertResult = await intermediateNode.commandArchivist.insert([command, ...payloads])

    // TODO: How to get source here???  (query.addresses)
    const insertQuery = { _destination: address, address, schema: ArchivistInsertQuerySchema }
    const builder = new QueryBoundWitnessBuilder({ destination: [address] }).witness(this.account)
    await builder.query(insertQuery)
    if (payloads) await builder.payloads(payloads)
    const [wrappedQuery] = await builder.build()
    const queryBridge = asBridgeInstance(await this.resolve(this.queryBridge))
    if (!queryBridge) throw new Error(`${moduleName}: Unable to resolve queryBridge for query`)
    // TODO: As archivist with insert (asWriteArchivistModule)
    const queryArchivist = asArchivistModule(await queryBridge.resolve(this.queryArchivist)) as unknown as Archivist
    if (!queryArchivist) throw new Error(`${moduleName}: Unable to resolve queryArchivist for query`)
    const insertValue = payloads ? [wrappedQuery, ...payloads] : [wrappedQuery]
    const insertResult = await queryArchivist.insert?.(insertValue)
    // TODO: Deeper assertions here (length, hashes?)
    if (!insertResult) throw new Error(`${moduleName}: Unable to issue query to queryArchivist`)
    const context = new Promise<ModuleQueryResult>((resolve, reject) => {
      // TODO: Hook response queue here and subscribe to response event with competing timeout
      reject(`${moduleName}: Timeout waiting for query response`)
    })
    return context
  }
  override targetQueryable(_address: string, _query: QueryBoundWitness, _payloads?: Payload[], _queryConfig?: ModuleConfig): boolean {
    return true
  }

  protected override startHandler(): Promise<boolean> {
    // Validate necessary configuration
    this._configQueriesArchivist = assertEx(
      this.config.queries?.archivist,
      `${moduleName}: Missing entry for query.archivist in module configuration`,
    )
    this._configQueriesBoundWitnessDiviner = assertEx(
      this.config.queries?.boundWitnessDiviner,
      `${moduleName}: Missing entry for query.boundWitnessDiviner in module configuration`,
    )
    this._configQueriesBridge = assertEx(this.config.queries?.bridge, `${moduleName}: Missing entry for query.bridge in module configuration`)
    this._configResponsesArchivist = assertEx(
      this.config.responses?.archivist,
      `${moduleName}: Missing entry for response.archivist in module configuration`,
    )
    this._configResponsesBoundWitnessDiviner = assertEx(
      this.config.responses?.boundWitnessDiviner,
      `${moduleName}: Missing entry for response.boundWitnessDiviner in module configuration`,
    )
    this._configResponsesBridge = assertEx(this.config.responses?.bridge, `${moduleName}: Missing entry for response.bridge in module configuration`)
    return Promise.resolve(true)
  }

  protected async zzz_internalHousekeeping(): Promise<void> {
    // TODO:
    // - Enumerate all local modules (or ones that have issued commands)
    // - check for commands to local modules
    // - issue commands against local modules
    // - Check for responses to local modules
    // - Execute event handlers to notify local modules
    await Promise.resolve()
  }
}
