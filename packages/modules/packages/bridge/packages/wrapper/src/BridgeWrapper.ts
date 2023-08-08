import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import {
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
  BridgeInstance,
  BridgeModule,
  BridgeQuery,
  isBridgeInstance,
  isBridgeModule,
} from '@xyo-network/bridge-model'
import {
  constructableModuleWrapper,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleQueryResult,
  ModuleWrapper,
} from '@xyo-network/module'
import { Payload, Query } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

constructableModuleWrapper()
export class BridgeWrapper<TWrappedModule extends BridgeModule = BridgeModule>
  extends ModuleWrapper<TWrappedModule>
  implements BridgeInstance<TWrappedModule['params']>
{
  static override instanceIdentityCheck = isBridgeInstance
  static override moduleIdentityCheck = isBridgeModule

  get connected(): boolean {
    throw Error('Not supported')
  }

  get targetDownResolver() {
    return this.module.targetDownResolver
  }

  async connect(uri?: string): Promise<boolean> {
    const queryPayload: BridgeQuery = { schema: BridgeConnectQuerySchema, uri }
    await this.sendQuery(queryPayload)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const queryPayload: BridgeQuery = { schema: BridgeDisconnectQuerySchema, uri }
    await this.sendQuery(queryPayload)
    return true
  }

  getRootAddress(): Promisable<string> {
    throw new Error('Method not implemented.')
  }

  targetConfig(address: string): ModuleConfig {
    return this.module.targetConfig(address)
  }

  async targetDiscover(address: string): Promise<Payload[]> {
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
    return await this.sendTargetQuery(address, queryPayload)
  }

  targetQueries(address: string): string[] {
    return this.module.targetQueries(address)
  }

  async targetQuery<T extends QueryBoundWitness = QueryBoundWitness>(address: string, query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.module.targetQuery(address, query, payloads)
  }

  async targetQueryable(address: string, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.module.targetQueryable(address, query, payloads, queryConfig)
  }

  async targetResolve(address: string, filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  async targetResolve(address: string, nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  async targetResolve(
    address: string,
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<Promisable<ModuleInstance | ModuleInstance[] | undefined>> {
    return await this.module.targetResolve(address, nameOrAddressOrFilter, options)
  }

  protected async sendTargetQuery<T extends Query>(address: string, queryPayload: T, payloads?: Payload[]): Promise<Payload[]> {
    const query = await this.bindQuery(queryPayload, payloads)
    const [, resultPayloads, errors] = await this.module.targetQuery(address, query[0], query[1])
    //TODO: figure out a rollup error solution
    if (errors?.length > 0) {
      throw errors[0]
    }
    return resultPayloads
  }
}
