import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import { isAddress } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import { spanAsync } from '@xylabs/telemetry'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  ModuleConfig, ModuleQueryHandlerResult, ModuleQueryResult,
} from '@xyo-network/module-model'
import { creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithoutPrivateStorageMeta,
} from '@xyo-network/payload-model'
import type {
  CustomWitnessInstance,
  WitnessInstance,
  WitnessModuleEventData,
  WitnessObserveQuery,
  WitnessParams,
  WitnessQueries,
} from '@xyo-network/witness-model'
import {
  WitnessConfigSchema,
  WitnessObserveQuerySchema,
} from '@xyo-network/witness-model'

creatableModule()
export abstract class AbstractWitness<
  TParams extends WitnessParams = WitnessParams,
  TIn extends Payload = Payload,
  TOut extends Payload = Payload,
  TEventData extends WitnessModuleEventData<WitnessInstance<TParams, TIn, TOut>, TIn, TOut> = WitnessModuleEventData<
    WitnessInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
>
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomWitnessInstance<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, WitnessConfigSchema]
  static override readonly defaultConfigSchema: Schema = WitnessConfigSchema
  static override readonly uniqueName = globallyUnique('AbstractWitness', AbstractWitness, 'xyo')

  private _archivistInstance: ArchivistInstance | undefined

  override get queries(): string[] {
    return [WitnessObserveQuerySchema, ...super.queries]
  }

  async getArchivistInstance() {
    const archivistAddress = this.archivist
    this._archivistInstance = this._archivistInstance ?? (isAddress(archivistAddress) ? await this.resolve(archivistAddress) : undefined)
    return this._archivistInstance
  }

  /** @function observe The main entry point for a witness.  Do not override this function.  Implement/override observeHandler for custom functionality */
  async observe(inPayloads?: TIn[]): Promise<(WithoutPrivateStorageMeta<TOut>)[]> {
    this._noOverride('observe')
    this.isSupportedQuery(WitnessObserveQuerySchema, 'observe')
    return await spanAsync('observe', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        return await this.busy(async () => {
          await this.globalReentrancyMutex?.acquire()
          this._noOverride('observe')
          await this.started('throw')
          await this.emit('observeStart', { inPayloads, mod: this } as TEventData['observeStart'])
          const outPayloads = assertEx(await this.observeHandler(inPayloads), () => 'Trying to witness nothing')
          // assertEx(outPayloads.length > 0, 'Trying to witness empty list')
          for (const payload of outPayloads ?? []) assertEx(payload.schema, () => 'observe: Missing Schema')

          const archivist = await this.getArchivistInstance()
          if (archivist) {
            await archivist.insert(outPayloads)
          }

          await this.emit('observeEnd', {
            inPayloads, mod: this, outPayloads,
          } as TEventData['observeEnd'])

          return PayloadBuilder.omitPrivateStorageMeta<TOut>(outPayloads)
        })
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async observeQuery(payloads?: TIn[], account?: AccountInstance): Promise<ModuleQueryResult<TOut>> {
    this._noOverride('observeQuery')
    const queryPayload: WitnessObserveQuery = { schema: WitnessObserveQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  /** @function queryHandler Calls observe for an observe query.  Override to support additional queries. */
  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<WitnessQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    // Remove the query payload from the arguments passed to us so we don't observe it
    const filteredObservation = (await PayloadBuilder.filterExclude(payloads, query.query)) as TIn[]
    switch (queryPayload.schema) {
      case WitnessObserveQuerySchema: {
        const observePayloads = await this.observe(filteredObservation)
        resultPayloads.push(...observePayloads)
        break
      }
      default: {
        return super.queryHandler(query, payloads)
      }
    }
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads) as ModuleQueryHandlerResult
  }

  /** @function observeHandler Implement or override to add custom functionality to a witness */
  protected abstract observeHandler(payloads?: TIn[]): Promisable<TOut[]>
}
