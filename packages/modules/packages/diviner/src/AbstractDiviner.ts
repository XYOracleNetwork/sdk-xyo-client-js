import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  DivinerModule,
  DivinerModuleEventData,
  DivinerParams,
  XyoDivinerConfigSchema,
  XyoDivinerDivineQuerySchema,
  XyoDivinerQuery,
} from '@xyo-network/diviner-model'
import { AbstractModule, ModuleConfig, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractDiviner<
    TParams extends DivinerParams = DivinerParams,
    TEventData extends DivinerModuleEventData = DivinerModuleEventData,
  >
  extends AbstractModule<TParams, TEventData>
  implements DivinerModule<TParams>
{
  static override configSchema: string = XyoDivinerConfigSchema
  static targetSchema: string

  override get queries(): string[] {
    return [XyoDivinerDivineQuerySchema, ...super.queries]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoDivinerQuery>(query, payloads)
    //remove the query payload
    const cleanPayloads = payloads?.filter((payload) => PayloadWrapper.hash(payload) !== query.query)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: Payload[] = []
    try {
      switch (typedQuery.schemaName) {
        case XyoDivinerDivineQuerySchema:
          await this.emit('reportStart', { inPayloads: payloads, module: this })
          resultPayloads.push(...(await this.divine(cleanPayloads)))
          await this.emit('reportEnd', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
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

  abstract divine(payloads?: Payload[]): Promisable<Payload[]>
}
