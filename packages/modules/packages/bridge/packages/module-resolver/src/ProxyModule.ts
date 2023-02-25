import { assertEx } from '@xylabs/assert'
import { BridgeModule } from '@xyo-network/bridge-model'
import { Module, ModuleConfig, ModuleFilter, ModuleQueryResult, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export class ProxyModule implements Module {
  constructor(protected readonly bridge: BridgeModule, protected readonly _address: string) {}

  get address() {
    return this._address
  }

  get config(): ModuleConfig {
    return this.bridge.targetConfig(this.address)
  }

  get queries() {
    return this.bridge.targetQueries(this.address)
  }

  get resolver() {
    return this.bridge.targetResolver
  }

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return assertEx(await this.bridge.targetQuery(this.address, query, payloads), 'Remote Query Failed')
  }

  async queryable(query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.bridge.targetQueryable(this.address, query, payloads, queryConfig)
  }

  /* Resolves a filter from the perspective of the module, including through the parent/gateway module */
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this.bridge.targetResolve(this.address, filter)
  }
}
