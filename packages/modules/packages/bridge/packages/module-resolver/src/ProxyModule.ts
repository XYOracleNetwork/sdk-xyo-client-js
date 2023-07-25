import { assertEx } from '@xylabs/assert'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ManifestPayloadSchema, ModuleManifestPayload } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  BaseEmitter,
  CompositeModuleResolver,
  Module,
  ModuleConfig,
  ModuleDescription,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleParams,
  ModuleQueryResult,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'

export type ProxyModuleConfigSchema = 'network.xyo.module.proxy.config'
export const ProxyModuleConfigSchema: ProxyModuleConfigSchema = 'network.xyo.module.proxy.config'

export type TProxyModuleConfig = ModuleConfig<{ schema: ProxyModuleConfigSchema }>

export type ProxyModuleParams = ModuleParams<
  TProxyModuleConfig,
  {
    address: string
    bridge: BridgeModule
  }
>

export class ProxyModule extends BaseEmitter<ModuleParams, ModuleEventData> implements ModuleInstance<ModuleParams, ModuleEventData> {
  readonly upResolver = new CompositeModuleResolver()

  constructor(public proxyParams: ProxyModuleParams) {
    super({ config: proxyParams.bridge.targetConfig(proxyParams.address) })
  }

  get address() {
    return this.proxyParams.address.toLowerCase()
  }

  get bridge() {
    return this.proxyParams.bridge
  }

  get config(): ModuleConfig {
    return this.bridge.targetConfig(this.address)
  }

  get downResolver() {
    return this.bridge.targetDownResolver(this.address)
  }

  get queries() {
    return this.bridge.targetQueries(this.address)
  }

  addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    throw Error('Not Implemented')
  }

  async describe(): Promise<ModuleDescription> {
    const description: ModuleDescription = {
      address: this.address,
      queries: this.queries,
    }
    if (this.config.name) {
      description.name = this.config.name
    }

    const discover = await this.discover()

    description.children = compact(
      discover?.map((payload) => {
        const address = payload.schema === AddressSchema ? (payload as AddressPayload).address : undefined
        return address != this.address ? address : undefined
      }) ?? [],
    )

    return description
  }

  discover(): Promisable<Payload[]> {
    return this.bridge.targetDiscover()
  }

  manifest(): Promisable<ModuleManifestPayload> {
    const name = this.config.name ?? 'Anonymous'
    return { config: { name, ...this.config }, schema: ManifestPayloadSchema }
  }

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    throw Error('Not Implemented')
  }

  previousHash(): Promise<string | undefined> {
    throw Error('Not Implemented')
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    const result = assertEx(await this.bridge.targetQuery(this.address, query, payloads), 'Remote Query Failed')
    await this.emit('moduleQueried', { module: this, payloads, query, result })
    return result
  }

  async queryable(query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.bridge.targetQueryable(this.address, query, payloads, queryConfig)
  }

  /* Resolves a filter from the perspective of the module, including through the parent/gateway module */
  resolve(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  resolve(nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  async resolve(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      return await this.bridge.targetResolve(this.address, nameOrAddressOrFilter, options)
    } else {
      return await this.bridge.targetResolve(this.address, nameOrAddressOrFilter, options)
    }
  }
}
