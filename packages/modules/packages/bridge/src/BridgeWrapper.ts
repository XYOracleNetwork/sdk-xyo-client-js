import {
  ModuleConfig,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleQueryResult,
  ModuleWrapper,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { BridgeModule } from './Bridge'
import { XyoBridgeConnectQuerySchema, XyoBridgeDisconnectQuerySchema, XyoBridgeQuery } from './Queries'

export class BridgeWrapper extends ModuleWrapper<BridgeModule> implements BridgeModule {
  public get targetResolver() {
    return this.module.targetResolver
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

  async targetDiscover(address: string): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return await this.sendTargetQuery(address, queryPayload)
  }

  async targetQuery<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    address: string,
    query: T,
    payloads?: XyoPayload[],
  ): Promise<ModuleQueryResult> {
    return await this.module.targetQuery(address, query, payloads)
  }

  async targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): Promise<boolean> {
    return await this.module.targetQueryable(address, query, payloads, queryConfig)
  }

  async targetResolve(address: string, filter?: ModuleFilter) {
    return await this.module.targetResolve(address, filter)
  }

  protected async sendTargetQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    address: string,
    queryPayload: T,
    payloads?: XyoPayloads,
  ): Promise<XyoPayload[]> {
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.targetQuery(address, query[0], query[1])
    this.throwErrors(query, result)
    return result[1]
  }
}
