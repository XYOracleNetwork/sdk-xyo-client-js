import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import { delay } from '@xylabs/delay'
import type { EventUnsubscribeFunction } from '@xylabs/events'
import { forget } from '@xylabs/forget'
import type { Logger } from '@xylabs/logger'
import type { AsTypeFunction } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { RetryConfig, RetryConfigWithComplete } from '@xylabs/retry'
import { retry } from '@xylabs/retry'
import { spanAsync } from '@xylabs/telemetry'
import {
  isDefined, isNull, isUndefined,
} from '@xylabs/typeof'
import type { AccountInstance } from '@xyo-network/account-model'
import { isArchivistInstance } from '@xyo-network/archivist-model'
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
  DivinerConfigSchema, DivinerDivineQuerySchema, isDivinerInstance,
} from '@xyo-network/diviner-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import {
  asModuleInstance,
  type ModuleConfig, type ModuleIdentifier, type ModuleInstance, type ModuleQueryHandlerResult, type ModuleQueryResult,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithoutPrivateStorageMeta,
} from '@xyo-network/payload-model'
import { isWitnessInstance } from '@xyo-network/witness-model'

const delayedResolve = async <T extends ModuleInstance>(
  parent: ModuleInstance,
  id: ModuleIdentifier,
  closure: (mod: T | null) => void,
  as: AsTypeFunction<T> = asModuleInstance,
  timeout = 30_000,
  logger?: Logger,
) => {
  const start = Date.now()
  let result: T | undefined
  while (isUndefined(result)) {
    result = as(await parent.resolve(id))
    if (isDefined(result)) {
      closure(result)
      break
    } else if (Date.now() - start > timeout) {
      logger?.error(`Timed out waiting for ${id} to resolve`)
      closure(null)
    }
    await delay(500)
  }
}

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

  private _eventUnsubscribeFunctions: EventUnsubscribeFunction[] = []

  override get queries(): string[] {
    return [DivinerDivineQuerySchema, ...super.queries]
  }

  /** @function divine The main entry point for a diviner.  Do not override this function.  Implement/override divineHandler for custom functionality */
  async divine(payloads: TIn[] = [], retryConfigIn?: RetryConfigWithComplete): Promise<DivinerDivineResult<TOut>[]> {
    this._noOverride('divine')
    this.isSupportedQuery(DivinerDivineQuerySchema, 'divine')
    return await spanAsync('divine', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        return await this.busy(async () => {
          const retryConfig = retryConfigIn ?? this.config.retry
          await this.startedAsync('throw')
          await this.emit('divineStart', { inPayloads: payloads, mod: this })
          let outPayloads: TOut[] = []
          let errors: Error[] = []
          try {
            outPayloads = (retryConfig ? await retry(() => this.divineHandler(payloads), retryConfig) : await this.divineHandler(payloads)) ?? []
          } catch (ex) {
            errors.push(ex as Error)
            this.logger?.error(`Error in divineHandler: ${ex}`)
          }
          await this.emit('divineEnd', {
            errors, inPayloads: payloads, mod: this, outPayloads,
          })
          if (errors.length > 0) {
            throw new Error(`Divine failed with ${errors.length} errors: ${errors.map(e => e.message).join(', ')}`)
          }
          return PayloadBuilder.omitPrivateStorageMeta<TOut>(outPayloads)
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async divineQuery(payloads?: TIn[], account?: AccountInstance, _retry?: RetryConfig): Promise<ModuleQueryResult<TOut>> {
    this._noOverride('divineQuery')
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
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads) as ModuleQueryHandlerResult
  }

  protected override async startHandler() {
    const { eventSubscriptions = [] } = this.config

    for (const subscription of eventSubscriptions) {
      const {
        sourceEvent, sourceModule, targetModuleFunction,
      } = subscription
      if (targetModuleFunction === 'divine') {
        forget(delayedResolve(this, sourceModule, (sourceModuleInstance: ModuleInstance | null) => {
          if (isNull(sourceModuleInstance)) {
            this.logger?.error(`Failed to resolve ${sourceModule} for ${this.modName}`)
          } else {
            if (isArchivistInstance(sourceModuleInstance)) {
              if (sourceEvent === 'inserted') {
                this._eventUnsubscribeFunctions.push(
                  sourceModuleInstance.on(sourceEvent, async ({ outPayloads, payloads }) => {
                    await this.divine((outPayloads ?? payloads) as Payload[] as TIn[])
                  }),
                )
              } else {
                this.logger?.warn(`Unsupported sourceEvent ${sourceEvent} for ${sourceModuleInstance.modName}`)
              }
            } else if (isDivinerInstance(sourceModuleInstance)) {
              if (sourceEvent === 'divineEnd') {
                this._eventUnsubscribeFunctions.push(
                  sourceModuleInstance.on(sourceEvent, async ({ outPayloads }) => {
                    await this.divine(outPayloads as Payload[] as TIn[])
                  }),
                )
              } else {
                this.logger?.warn(`Unsupported sourceEvent ${sourceEvent} for ${sourceModuleInstance.modName}`)
              }
            } else if (isWitnessInstance(sourceModuleInstance)) {
              if (sourceEvent === 'observeEnd') {
                this._eventUnsubscribeFunctions.push(
                  sourceModuleInstance.on(sourceEvent, async ({ outPayloads }) => {
                    await this.divine(outPayloads as Payload[] as TIn[])
                  }),
                )
              } else {
                this.logger?.warn(`Unsupported sourceEvent ${sourceEvent} for ${sourceModuleInstance.modName}`)
              }
            }
          }
        }, asModuleInstance, undefined, this.logger))
      }
    }

    return await super.startHandler()
  }

  protected override async stopHandler() {
    for (const unsubscribe of this._eventUnsubscribeFunctions) {
      unsubscribe()
    }
    this._eventUnsubscribeFunctions = []
    this._eventUnsubscribeFunctions = []
    return await super.stopHandler()
  }

  /** @function divineHandler Implement or override to add custom functionality to a diviner */
  protected abstract divineHandler(payloads?: TIn[]): Promisable<TOut[]>
}
