import { assertEx } from '@xylabs/assert'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifest } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  BaseEmitter,
  CompositeModuleResolver,
  IndirectModule,
  Module,
  ModuleConfig,
  ModuleDescription,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
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

export class ProxyModule extends BaseEmitter<ProxyModuleParams, ModuleEventData> implements Module<ModuleParams, ModuleEventData> {
  readonly upResolver = new CompositeModuleResolver()

  constructor(params: ProxyModuleParams) {
    super(params)
  }

  get address() {
    return this.params.address.toLowerCase()
  }

  get bridge() {
    return this.params.bridge
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

  manifest(): Promisable<ModuleManifest> {
    const name = this.config.name ?? 'Anonymous'
    return { config: { name, ...this.config } }
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
  resolve<TModule extends IndirectModule = IndirectModule>(filter?: ModuleFilter, options?: ModuleFilterOptions): Promisable<TModule[]>
  resolve<TModule extends IndirectModule = IndirectModule>(nameOrAddress: string, options?: ModuleFilterOptions): Promisable<TModule | undefined>
  async resolve<TModule extends IndirectModule = IndirectModule>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<TModule | TModule[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      return await this.bridge.targetResolve<TModule>(this.address, nameOrAddressOrFilter, options)
    } else {
      return await this.bridge.targetResolve<TModule>(this.address, nameOrAddressOrFilter, options)
    }
  }
}
