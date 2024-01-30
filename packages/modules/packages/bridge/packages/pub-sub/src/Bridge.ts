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

  // TODO: Get from config
  protected readonly gatewayAddress = 'pub-sub'

  private _gateway: BridgeInstance | undefined

  get queryArchivist() {
    return assertEx(this.config.queries?.archivist, `${moduleName}: Missing config for query.archivist in module configuration`)
  }
  get queryBoundWitnessDiviner() {
    return assertEx(this.config.queries?.boundWitnessDiviner, `${moduleName}: Missing config for query.boundWitnessDiviner in module configuration`)
  }
  get queryBridge() {
    return assertEx(this.config.queries?.bridge, `${moduleName}: Missing config for query.bridge in module configuration`)
  }
  get responseArchivist() {
    return assertEx(this.config.responses?.archivist, `${moduleName}: Missing config for response.archivist in module configuration`)
  }
  get responseBoundWitnessDiviner() {
    return assertEx(
      this.config.responses?.boundWitnessDiviner,
      `${moduleName}: Missing config for response.boundWitnessDiviner in module configuration`,
    )
  }
  get responseBridge() {
    return assertEx(this.config.responses?.bridge, `${moduleName}: Missing config for response.bridge in module configuration`)
  }
  protected get gateway(): BridgeInstance | undefined {
    return this._gateway
  }
  protected set gateway(v: BridgeInstance | undefined) {
    this._gateway = v
  }

  async connect(): Promise<boolean> {
    await super.startHandler()
    this.gateway = await this.resolve(this.gatewayAddress)
    if (this.gateway) {
      if (!this.gateway.connected) await this.gateway.connect()
      this.connected = this.gateway.connected
      if (this.connected) {
        // TODO: Further resolve supporting modules (Archivists, Diviners, etc.)
        const intermediaryModules = [this.queryArchivist, this.queryBoundWitnessDiviner, this.responseArchivist, this.responseBoundWitnessDiviner]
        const resolved = await Promise.all(intermediaryModules.map((address) => this.resolve(address)))
      }
      return this.connected
    } else {
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    await this.gateway?.disconnect()
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
}
