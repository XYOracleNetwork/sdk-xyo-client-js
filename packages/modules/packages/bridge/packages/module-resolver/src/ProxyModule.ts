import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BridgeModule } from '@xyo-network/bridge-model'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import { BaseEmitter } from '@xyo-network/module-abstract'
import {
  AddressPreviousHashPayload,
  ModuleBusyEventArgs,
  ModuleConfig,
  ModuleDescription,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleParams,
  ModuleQueryResult,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'
import { Payload } from '@xyo-network/payload-model'

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

  private _busyCount = 0

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
    return assertEx(this.bridge.targetDownResolver(this.address), 'Unable to get resolver')
  }

  get id() {
    return this.config.name ?? this.address
  }

  get queries() {
    return this.bridge.targetQueries(this.address)
  }

  addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    throw new Error('Not Implemented')
  }

  async busy<R>(closure: () => Promise<R>) {
    if (this._busyCount <= 0) {
      this._busyCount = 0
      const args: ModuleBusyEventArgs = { busy: true, module: this }
      await this.emit('moduleBusy', args)
    }
    this._busyCount++
    try {
      return await closure()
    } finally {
      this._busyCount--
      if (this._busyCount <= 0) {
        this._busyCount = 0
        const args: ModuleBusyEventArgs = { busy: false, module: this }
        await this.emit('moduleBusy', args)
      }
    }
  }

  async describe(): Promise<ModuleDescription> {
    return await this.busy(async () => {
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
          return address == this.address ? undefined : address
        }) ?? [],
      )

      return description
    })
  }

  async discover(): Promise<Payload[]> {
    return await this.busy(async () => {
      return await this.bridge.targetDiscover()
    })
  }

  manifest(_depth?: number): Promisable<ModuleManifestPayload> {
    const name = this.config.name ?? 'Anonymous'
    return { config: { name, ...this.config }, schema: ModuleManifestPayloadSchema }
  }

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    throw new Error('Not Implemented')
  }

  previousHash(): Promise<string | undefined> {
    throw new Error('Not Implemented')
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.busy(async () => {
      const result = assertEx(await this.bridge.targetQuery(this.address, query, payloads), 'Remote Query Failed')
      await this.emit('moduleQueried', { module: this, payloads, query, result })
      return result
    })
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
    return await this.busy(async () => {
      return await (typeof nameOrAddressOrFilter === 'string' ?
        this.bridge.targetResolve(this.address, nameOrAddressOrFilter, options)
      : this.bridge.targetResolve(this.address, nameOrAddressOrFilter, options))
    })
  }
}
