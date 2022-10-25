import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoModule, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoDivinerConfig } from './Config'
import { DivinerModule } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery } from './Queries'

export type XyoDivinerParams = XyoModuleParams

export abstract class XyoDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoModule<TConfig> implements DivinerModule {
  static override configSchema: string
  static targetSchema: string

  public get targetSchema() {
    return this.config?.targetSchema
  }

  static override async create(params?: XyoModuleParams<XyoDivinerConfig>): Promise<XyoDiviner> {
    params?.logger?.debug(`config: ${JSON.stringify(params.config, null, 2)}`)
    const actualParams: XyoModuleParams<XyoDivinerConfig> = params ?? {}
    actualParams.config = params?.config ?? { schema: this.configSchema, targetSchema: this.targetSchema }
    return (await super.create(actualParams)) as XyoDiviner
  }

  public override queries(): string[] {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: T,
    payloads?: XyoPayload[],
  ): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoDivinerQuery>(query, payloads)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()

    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schemaName) {
        case XyoDivinerDivineQuerySchema:
          resultPayloads.push(...(await this.divine(payloads)))
          break
        default:
          return super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }

  abstract divine(payloads?: XyoPayload[]): Promisable<XyoPayload[]>
}

export abstract class XyoTimestampDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<TConfig> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<TConfig> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractTimestampDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoTimestampDiviner<TConfig> {}
