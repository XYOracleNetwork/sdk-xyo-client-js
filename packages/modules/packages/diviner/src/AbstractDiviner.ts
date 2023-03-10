import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { DivinerModule, DivinerParams, XyoDivinerConfigSchema, XyoDivinerDivineQuerySchema, XyoDivinerQuery } from '@xyo-network/diviner-model'
import { AbstractModule, ModuleConfig, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractDiviner<TParams extends DivinerParams = DivinerParams>
  extends AbstractModule<TParams>
  implements DivinerModule<TParams>
{
  static override configSchema: string = XyoDivinerConfigSchema
  static targetSchema: string

  override get queries(): string[] {
    return [XyoDivinerDivineQuerySchema, ...super.queries]
  }

  static override async create<TParams extends DivinerParams = DivinerParams>(params?: TParams) {
    return (await super.create(params)) as AbstractDiviner<TParams>
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoDivinerQuery>(query, payloads)
    //remove the query payload
    const cleanPayloads = payloads?.filter((payload) => PayloadWrapper.hash(payload) !== query.query)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schemaName) {
        case XyoDivinerDivineQuerySchema:
          resultPayloads.push(...(await this.divine(cleanPayloads)))
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
