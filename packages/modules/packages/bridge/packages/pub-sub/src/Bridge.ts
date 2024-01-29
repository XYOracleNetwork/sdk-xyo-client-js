import { Promisable } from '@xylabs/promise'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { creatableModule, ModuleConfig, ModuleEventData, ModuleQueryResult } from '@xyo-network/module-model'
import { Payload, QueryFields, SchemaFields } from '@xyo-network/payload-model'

import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  static override configSchemas = [PubSubBridgeConfigSchema]

  // TODO: Get from config
  protected readonly gatewayAddress = 'pub-sub'

  private _gateway: BridgeModule | undefined
  get gateway(): BridgeModule | undefined {
    return this._gateway
  }
  protected set gateway(v: BridgeModule | undefined) {
    this._gateway = v
  }

  async connect(): Promise<boolean> {
    await super.startHandler()
    this.gateway = await this.resolve(this.gatewayAddress)
    if (this.gateway) {
      this.connected = true
      // TODO: Further resolve Archivists
      return true
    } else {
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<boolean> {
    await Promise.resolve()
    this.gateway = undefined
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
