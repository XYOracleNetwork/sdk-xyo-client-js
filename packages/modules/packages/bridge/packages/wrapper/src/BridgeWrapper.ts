import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import {
  BridgeConnectQuerySchema,
  BridgeDisconnectQuerySchema,
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
  ModuleQueryResult,
  ModuleWrapper,
} from '@xyo-network/module'
import { Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

constructableModuleWrapper()
export class BridgeWrapper extends ModuleWrapper<BridgeModule> {
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

  async targetResolve(address: string, filter?: ModuleFilter) {
    return await this.module.targetResolve(address, filter)
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
