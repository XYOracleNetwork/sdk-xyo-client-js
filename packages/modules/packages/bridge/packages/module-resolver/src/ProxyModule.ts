import { assertEx } from '@xylabs/assert'
import { BridgeModule } from '@xyo-network/bridge-model'
import {
  BaseEmitter,
  CompositeModuleResolver,
  Module,
  ModuleConfig,
  ModuleEventData,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
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

export class ProxyModule extends BaseEmitter<ProxyModuleParams, ModuleEventData> implements Module<ModuleParams, ModuleEventData> {
  readonly upResolver = new CompositeModuleResolver()

  constructor(params: ProxyModuleParams) {
    super(params)
  }

  get address() {
    return this.params.address
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

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    const result = assertEx(await this.bridge.targetQuery(this.address, query, payloads), 'Remote Query Failed')
    await this.emit('moduleQueried', { module: this, payloads, query, result })
    return result
  }

  async queryable(query: XyoQueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.bridge.targetQueryable(this.address, query, payloads, queryConfig)
  }

  /* Resolves a filter from the perspective of the module, including through the parent/gateway module */
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.bridge.targetResolve(this.address, filter)
  }
}
