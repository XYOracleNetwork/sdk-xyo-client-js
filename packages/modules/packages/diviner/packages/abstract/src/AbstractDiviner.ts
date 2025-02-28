import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { RetryConfig, RetryConfigWithComplete } from '@xylabs/retry'
import { retry } from '@xylabs/retry'
import type { AccountInstance } from '@xyo-network/account-model'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type {
  AttachableDivinerInstance,
  DivinerDivineQuery,
  DivinerDivineResult,
  DivinerInstance,
  DivinerModuleEventData,
  DivinerParams,
  DivinerQueries,
} from '@xyo-network/diviner-model'
import {
  DivinerConfigSchema,
  DivinerDivineQuerySchema,
} from '@xyo-network/diviner-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  ModuleConfig, ModuleQueryHandlerResult, ModuleQueryResult,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithoutPrivateStorageMeta,
} from '@xyo-network/payload-model'

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
  implements AttachableDivinerInstance<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, DivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = DivinerConfigSchema
  static readonly targetSchema: string
  static override readonly uniqueName = globallyUnique('AbstractDiviner', AbstractDiviner, 'xyo')

  override get queries(): string[] {
    return [DivinerDivineQuerySchema, ...super.queries]
  }

  /** @function divine The main entry point for a diviner.  Do not override this function.  Implement/override divineHandler for custom functionality */
  async divine(payloads: TIn[] = [], retryConfigIn?: RetryConfigWithComplete): Promise<DivinerDivineResult<TOut>[]> {
    this._noOverride('divine')
    if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
      return []
    }
    try {
      await this.globalReentrancyMutex?.acquire()
      return await this.busy(async () => {
        const retryConfig = retryConfigIn ?? this.config.retry
        await this.started('throw')
        await this.emit('divineStart', { inPayloads: payloads, mod: this })
        const resultPayloads
          = (retryConfig ? await retry(() => this.divineHandler(payloads), retryConfig) : await this.divineHandler(payloads)) ?? []
        await this.emit('divineEnd', {
          errors: [], inPayloads: payloads, mod: this, outPayloads: resultPayloads,
        })
        return PayloadBuilder.omitPrivateStorageMeta(resultPayloads)
      })
    } finally {
      this.globalReentrancyMutex?.release()
    }
  }

  async divineQuery(payloads?: TIn[], account?: AccountInstance, _retry?: RetryConfig): Promise<ModuleQueryResult<TOut>> {
    const queryPayload: DivinerDivineQuery = { schema: DivinerDivineQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  /** @function queryHandler Calls divine for a divine query.  Override to support additional queries. */
  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<DivinerQueries>(query, payloads)
    // remove the query payload
    const cleanPayloads = await PayloadBuilder.filterExclude(payloads, query.query)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: WithoutPrivateStorageMeta<Payload>[] = []
    switch (queryPayload.schema) {
      case DivinerDivineQuerySchema: {
        resultPayloads.push(...(await this.divine(cleanPayloads as TIn[])))
        break
      }
      default: {
        return super.queryHandler(query, payloads)
      }
    }
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads)
  }

  /** @function divineHandler Implement or override to add custom functionality to a diviner */
  protected abstract divineHandler(payloads?: TIn[]): Promisable<TOut[]>
}
