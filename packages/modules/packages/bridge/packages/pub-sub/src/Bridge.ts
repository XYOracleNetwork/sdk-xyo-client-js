import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeInstance, BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { creatableModule, ModuleConfig, ModuleEventData, ModuleQueryResult } from '@xyo-network/module-model'
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
    _address: string,
    _query: SchemaFields & object & QueryFields & { schema: string },
    _payloads?: Payload[] | undefined,
  ): Promise<ModuleQueryResult> {
    if (!this.connected) {
      throw new Error('Not connected')
    }
    await this.started('throw')
    throw new Error('Method not implemented.')
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
}
