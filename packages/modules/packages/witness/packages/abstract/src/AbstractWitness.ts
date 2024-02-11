import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { creatableModule, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import {
  CustomWitnessInstance,
  WitnessConfigSchema,
  WitnessInstance,
  WitnessModuleEventData,
  WitnessObserveQuerySchema,
  WitnessParams,
  WitnessQuery,
  WitnessQueryBase,
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
  implements CustomWitnessInstance<TParams, TIn, TOut, TEventData>
{
  static override readonly configSchemas: string[] = [WitnessConfigSchema]

  private _archivistInstance: ArchivistInstance | undefined

  get archivist() {
    return this.config.archivist
  }

  override get queries(): string[] {
    return [WitnessObserveQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<WitnessQueryBase['schema'], string> {
    return {
      'network.xyo.query.witness.observe': '1/1',
    }
  }

  async getArchivistInstance() {
    const archivistAddress = this.archivist
    this._archivistInstance = this._archivistInstance ?? (archivistAddress ? await this.resolve(archivistAddress) : undefined)
    return this._archivistInstance
  }

  /** @function observe The main entry point for a witness.  Do not override this function.  Implement/override observeHandler for custom functionality */
  async observe(inPayloads?: TIn[]): Promise<TOut[]> {
    this._noOverride('observe')
    await this.started('throw')
    await this.emit('observeStart', { inPayloads, module: this } as TEventData['observeStart'])
    const outPayloads = assertEx(await this.observeHandler(inPayloads), 'Trying to witness nothing')
    //assertEx(outPayloads.length > 0, 'Trying to witness empty list')
    for (const payload of outPayloads ?? []) assertEx(payload.schema, 'observe: Missing Schema')

    const archivist = await this.getArchivistInstance()
    if (archivist) {
      await archivist.insert(outPayloads)
    }

    await this.emit('observeEnd', { inPayloads, module: this, outPayloads } as TEventData['observeEnd'])

    return outPayloads
  }

  /** @function queryHandler Calls observe for an observe query.  Override to support additional queries. */
  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<WitnessQuery>(query, payloads)
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
    return resultPayloads
  }

  /** @function observeHandler Implement or override to add custom functionality to a witness */
  protected abstract observeHandler(payloads?: TIn[]): Promisable<TOut[]>
}
