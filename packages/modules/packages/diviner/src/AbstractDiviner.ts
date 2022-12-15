import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AbstractModule, ModuleParams, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { DivinerConfig } from './Config'
import { DivinerModule } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery } from './Queries'

export type DivinerParams = ModuleParams

/** @deprecated use DivinerParams instead */
export type XyoDivinerParams = DivinerParams
export abstract class AbstractDiviner<TConfig extends DivinerConfig = DivinerConfig> extends AbstractModule<TConfig> implements DivinerModule {
  static override configSchema: string
  static targetSchema: string

  public get targetSchema() {
    return this.config?.targetSchema
  }

  static override async create(params?: Partial<ModuleParams<DivinerConfig>>): Promise<AbstractDiviner> {
    return (await super.create(params)) as AbstractDiviner
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
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new Account()

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

/** @deprecated use AbstractDiviner instead*/
export abstract class XyoTimestampDiviner<TConfig extends DivinerConfig = DivinerConfig> extends AbstractDiviner<TConfig> {}

/** @deprecated use AbstractDiviner instead*/
export abstract class XyoAbstractDiviner<TConfig extends DivinerConfig = DivinerConfig> extends AbstractDiviner<TConfig> {}

/** @deprecated use AbstractDiviner instead*/
export abstract class XyoDiviner<TConfig extends DivinerConfig = DivinerConfig> extends AbstractDiviner<TConfig> {}

/** @deprecated use AbstractDiviner instead*/
export abstract class XyoAbstractTimestampDiviner<TConfig extends DivinerConfig = DivinerConfig> extends AbstractDiviner<TConfig> {}
