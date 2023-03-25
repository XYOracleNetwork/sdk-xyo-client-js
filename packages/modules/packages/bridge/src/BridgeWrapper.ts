import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { BridgeModule, XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from '@xyo-network/bridge-model'
import {
  Module,
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleQueryResult,
  ModuleWrapper,
  Query,
  QueryBoundWitness,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class BridgeWrapper extends ModuleWrapper<BridgeModule> implements BridgeModule {
  get targetDownResolver() {
    return this.module.targetDownResolver
  }

  static override tryWrap(module?: Module, account?: AccountInstance): BridgeWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        //console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new BridgeWrapper({ account, module: module as BridgeModule })
      }
    }
  }

  static override wrap(module?: Module, account?: AccountInstance): BridgeWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as DivinerWrapper')
  }

  async connect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.parse<XyoBridgeQuery>({ schema: XyoBridgeConnectQuerySchema, uri })
    await this.sendQuery(queryPayload)
    return true
  }

  async disconnect(uri?: string): Promise<boolean> {
    const queryPayload = PayloadWrapper.parse<XyoBridgeQuery>({ schema: XyoBridgeDisconnectQuerySchema, uri })
    await this.sendQuery(queryPayload)
    return true
  }

  targetConfig(address: string): ModuleConfig {
    return this.module.targetConfig(address)
  }

  async targetDiscover(address: string): Promise<Payload[] | undefined> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return await this.sendTargetQuery(address, queryPayload)
  }

  targetQueries(address: string): string[] {
    return this.module.targetQueries(address)
  }

  async targetQuery<T extends QueryBoundWitness = QueryBoundWitness>(
    address: string,
    query: T,
    payloads?: Payload[],
  ): Promise<ModuleQueryResult | undefined> {
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
  ): Promise<Payload[] | undefined> {
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.targetQuery(address, query[0], query[1])
    this.throwErrors(query, result)
    return result?.[1]
  }
}
