import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { AbstractModuleInstance, creatableModule, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
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
    TEventData extends WitnessModuleEventData<WitnessInstance<TParams>> = WitnessModuleEventData<WitnessInstance<TParams>>,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomWitnessInstance<TParams, TEventData>
{
  static override readonly configSchemas: string[] = [WitnessConfigSchema]

  override get queries(): string[] {
    return [WitnessObserveQuerySchema, ...super.queries]
  }

  get targetSet() {
    return this.config?.targetSet
  }

  protected override get _queryAccountPaths(): Record<WitnessQueryBase['schema'], string> {
    return {
      'network.xyo.query.witness.observe': '1/1',
    }
  }

  /** @function observe The main entry point for a witness.  Do not override this function.  Implement/override observeHandler for custom functionality */
  async observe(inPayloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    await this.emit('observeStart', { inPayloads: inPayloads, module: this })
    const outPayloads = assertEx(await this.observeHandler(inPayloads), 'Trying to witness nothing')
    assertEx(outPayloads.length > 0, 'Trying to witness empty list')
    outPayloads?.forEach((payload) => assertEx(payload.schema, 'observe: Missing Schema'))
    await this.emit('observeEnd', { inPayloads, module: this, outPayloads })
    return outPayloads
  }

  /** @function queryHandler Calls observe for an observe query.  Override to support additional queries. */
  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<WitnessQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    // Remove the query payload from the arguments passed to us so we don't observe it
    const filteredObservation = await PayloadHasher.filterExclude(payloads, query.query)
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
  protected abstract observeHandler(payloads?: Payload[]): Promisable<Payload[]>
}
