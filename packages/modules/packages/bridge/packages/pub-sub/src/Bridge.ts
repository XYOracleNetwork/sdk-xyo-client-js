import { Promisable } from '@xylabs/promise'
import { RetryConfig } from '@xylabs/retry'
import { AbstractBridge } from '@xyo-network/abstract-bridge'
import { BoundWitnessFields } from '@xyo-network/boundwitness-model'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifest } from '@xyo-network/manifest-model'
import { ArchivingModuleConfig, CosigningAddressSet, creatableModule, Labels, ModuleEventData, ModuleQueryResult } from '@xyo-network/module-model'
import { QueryFields, SchemaFields } from '@xyo-network/payload-model'

import { PubSubBridgeConfigSchema } from './Config'
import { PubSubBridgeParams } from './Params'

@creatableModule()
export class PubSubBridge<TParams extends PubSubBridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractBridge<TParams, TEventData>
  implements BridgeModule<TParams, TEventData>
{
  override getRootAddress(): Promisable<string> {
    throw new Error('Method not implemented.')
  }
  override targetConfig(address: string): SchemaFields &
    object & {
      readonly archivist?: string | undefined
      readonly labels?: Labels | undefined
      readonly name?: string | undefined
      readonly paging?: Record<string, { size?: number | undefined }> | undefined
      readonly retry?: RetryConfig | undefined
      schema: 'network.xyo.module.config'
      readonly security?:
        | {
            readonly allowAnonymous?: boolean | undefined
            readonly allowed?: Record<string, (string | CosigningAddressSet)[]> | undefined
            readonly disallowed?: Record<string, string[]> | undefined
          }
        | undefined
      readonly sign?: boolean | undefined
      readonly storeQueries?: boolean | undefined
      readonly timestamp?: boolean | undefined
    } & ArchivingModuleConfig {
    throw new Error('Method not implemented.')
  }
  override targetDiscover(address?: string | undefined, maxDepth?: number | undefined): Promisable<({ schema: string } & object)[]> {
    throw new Error('Method not implemented.')
  }
  override targetManifest(
    address: string,
    maxDepth?: number | undefined,
  ): Promisable<
    | (SchemaFields & object & ModuleManifest & { schema: 'network.xyo.module.manifest' })
    | (SchemaFields & object & ModuleManifest & { schema: 'network.xyo.node.manifest' })
  > {
    throw new Error('Method not implemented.')
  }
  override targetQueries(address: string): string[] {
    throw new Error('Method not implemented.')
  }
  override targetQuery(
    address: string,
    query: SchemaFields & object & QueryFields & { schema: string },
    payloads?: ({ schema: string } & object)[] | undefined,
  ): Promisable<ModuleQueryResult> {
    throw new Error('Method not implemented.')
  }
  override targetQueryable(
    address: string,
    query: SchemaFields &
      object &
      Omit<BoundWitnessFields & { query: string; resultSet?: string | undefined; schema: 'network.xyo.boundwitness' }, 'schema'> & {
        schema: 'network.xyo.boundwitness'
      },
    payloads?: ({ schema: string } & object)[] | undefined,
    queryConfig?:
      | (SchemaFields &
          object & {
            readonly archivist?: string | undefined
            readonly labels?: Labels | undefined
            readonly name?: string | undefined
            readonly paging?: Record<string, { size?: number | undefined }> | undefined
            readonly retry?: RetryConfig | undefined
            schema: 'network.xyo.module.config'
            readonly security?:
              | {
                  readonly allowAnonymous?: boolean | undefined
                  readonly allowed?: Record<string, (string | CosigningAddressSet)[]> | undefined
                  readonly disallowed?: Record<string, string[]> | undefined
                }
              | undefined
            readonly sign?: boolean | undefined
            readonly storeQueries?: boolean | undefined
            readonly timestamp?: boolean | undefined
          } & ArchivingModuleConfig)
      | undefined,
  ): boolean {
    throw new Error('Method not implemented.')
  }
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
}
