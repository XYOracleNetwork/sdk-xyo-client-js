import { AccountInstance } from '@xyo-network/account-model'
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
  Module,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleQueryResult,
  ModuleWrapper,
} from '@xyo-network/module'
import { Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

constructableModuleWrapper()
export class BridgeWrapper<TWrappedModule extends BridgeModule = BridgeModule>
  extends ModuleWrapper<TWrappedModule>
  implements BridgeInstance<TWrappedModule['params']>
{
  getRootAddress(): Promisable<string> {
    throw new Error('Method not implemented.')
  }
  loadAccount?: (() => Promisable<AccountInstance>) | undefined
  start?: (() => Promisable<boolean>) | undefined
  stop?: (() => Promisable<boolean>) | undefined
  static override instanceIdentityCheck = isBridgeInstance
  static override moduleIdentityCheck = isBridgeModule

  get targetDownResolver() {
    return this.module.targetDownResolver
  }

  async connect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.wrap<BridgeQuery>({ schema: BridgeConnectQuerySchema, uri })
    await this.sendQuery(queryPayload)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.wrap<BridgeQuery>({ schema: BridgeDisconnectQuerySchema, uri })
    await this.sendQuery(queryPayload)
    return true
  }

  targetConfig(address: string): ModuleConfig {
    return this.module.targetConfig(address)
  }

  async targetDiscover(address: string): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
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

  async targetResolve(address: string, filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<Module[]>
  async targetResolve(address: string, nameOrAddress: string, options?: ModuleFilterOptions): Promise<Module | undefined>
  async targetResolve(
    address: string,
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<Promisable<Module | Module[] | undefined>> {
    return await this.module.targetResolve(address, nameOrAddressOrFilter, options)
  }

  protected async sendTargetQuery<T extends Query | PayloadWrapper<Query>>(
    address: string,
    queryPayload: T,
    payloads?: Payload[],
  ): Promise<Payload[]> {
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.targetQuery(address, query[0], query[1])
    await this.throwErrors(query, result)
    return result[1]
  }
}
