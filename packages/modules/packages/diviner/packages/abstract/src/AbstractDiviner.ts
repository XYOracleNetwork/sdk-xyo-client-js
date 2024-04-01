import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { retry, RetryConfigWithComplete } from '@xylabs/retry'
import { globallyUnique } from '@xyo-network/account'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  AttachableDivinerInstance,
  DivinerConfigSchema,
  DivinerDivineQuerySchema,
  DivinerInstance,
  DivinerModuleEventData,
  DivinerParams,
  DivinerQueries,
} from '@xyo-network/diviner-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, WithMeta, WithSources } from '@xyo-network/payload-model'

export abstract class AbstractDiviner<
    TParams extends DivinerParams = DivinerParams,
    TIn extends Payload = Payload,
    TOut extends Payload = Payload,
    TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
      DivinerInstance<TParams, TIn, TOut>,
      TIn,
      TOut
    >,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements AttachableDivinerInstance<TParams, TIn, TOut, TEventData>
{
  static override readonly configSchemas: string[] = [DivinerConfigSchema]
  static targetSchema: string
  static override readonly uniqueName = globallyUnique('AbstractDiviner', AbstractDiviner, 'xyo')

  override get queries(): string[] {
    return [DivinerDivineQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<DivinerQueries['schema'], string> {
    return {
      'network.xyo.query.diviner.divine': '1/1',
    }
  }

  /** @function divine The main entry point for a diviner.  Do not override this function.  Implement/override divineHandler for custom functionality */
  divine(payloads: TIn[] = [], retryConfigIn?: RetryConfigWithComplete): Promise<WithSources<WithMeta<TOut>>[]> {
    this._noOverride('divine')
    return this.busy(async () => {
      const retryConfig = retryConfigIn ?? this.config.retry
      await this.started('throw')
      await this.emit('divineStart', { inPayloads: payloads, module: this })
      const resultPayloads: TOut[] =
        (retryConfig ? await retry(() => this.divineHandler(payloads), retryConfig) : await this.divineHandler(payloads)) ?? []
      await this.emit('divineEnd', { errors: [], inPayloads: payloads, module: this, outPayloads: resultPayloads })
      return await Promise.all(resultPayloads.map((payload) => PayloadBuilder.build(payload)))
    })
  }

  /** @function queryHandler Calls divine for a divine query.  Override to support additional queries. */
  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<DivinerQueries>(query, payloads)
    //remove the query payload
    const cleanPayloads = await PayloadBuilder.filterExclude(payloads, query.query)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case DivinerDivineQuerySchema: {
        resultPayloads.push(...(await this.divine(cleanPayloads as TIn[])))
        break
      }
      default: {
        return super.queryHandler(query, payloads)
      }
    }
    return resultPayloads
  }

  /** @function divineHandler Implement or override to add custom functionality to a diviner */
  protected abstract divineHandler(payloads?: TIn[]): Promisable<WithSources<TOut>[]>
}
