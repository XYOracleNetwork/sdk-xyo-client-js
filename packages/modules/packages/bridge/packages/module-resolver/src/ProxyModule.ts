import { assertEx } from '@xylabs/assert'
import { BridgeModule } from '@xyo-network/bridge-model'
import {
  BaseEmitter,
  CompositeModuleResolver,
  EventListener,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleQueriedEventArgs,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export class ProxyModule extends BaseEmitter implements Module {
  readonly upResolver = new CompositeModuleResolver()
  protected readonly moduleQueriedEventListeners: EventListener<ModuleQueriedEventArgs>[] = []

  constructor(protected readonly bridge: BridgeModule, protected readonly _address: string) {
    super()
  }

  get address() {
    return this._address
  }

  get config(): ModuleConfig {
    return this.bridge.targetConfig(this.address)
  }

  get downResolver() {
    return this.bridge.targetDownResolver
  }

  get queries() {
    return this.bridge.targetQueries(this.address)
  }

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    const result = assertEx(await this.bridge.targetQuery(this.address, query, payloads), 'Remote Query Failed')
    const args: ModuleQueriedEventArgs = { module: this, payloads, query, result }
    this.moduleQueriedEventListeners?.map((listener) => listener(args))
    return result
  }

  async queryable(query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.bridge.targetQueryable(this.address, query, payloads, queryConfig)
  }

  /* Resolves a filter from the perspective of the module, including through the parent/gateway module */
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.bridge.targetResolve(this.address, filter)
  }
}
