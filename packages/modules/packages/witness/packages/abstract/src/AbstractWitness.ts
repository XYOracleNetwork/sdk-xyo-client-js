import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { AbstractModuleInstance, creatableModule, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import {
  CustomWitnessModule,
  WitnessConfigSchema,
  WitnessModule,
  WitnessModuleEventData,
  WitnessObserveQuerySchema,
  WitnessParams,
  WitnessQuery,
  WitnessQueryBase,
} from '@xyo-network/witness-model'

creatableModule()
export abstract class AbstractWitness<
    TParams extends WitnessParams = WitnessParams,
    TEventData extends WitnessModuleEventData<WitnessModule<TParams>> = WitnessModuleEventData<WitnessModule<TParams>>,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomWitnessModule<TParams, TEventData>
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

  async observe(inPayloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    await this.emit('reportStart', { inPayloads: inPayloads, module: this })
    const outPayloads = assertEx(await this.observeHandler(inPayloads), 'Trying to witness nothing')
    assertEx(outPayloads.length > 0, 'Trying to witness empty list')
    outPayloads?.forEach((payload) => assertEx(payload.schema, 'observe: Missing Schema'))
    await this.emit('reportEnd', { inPayloads, module: this, outPayloads })
    return outPayloads
  }

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

  protected abstract observeHandler(payloads?: Payload[]): Promisable<Payload[]>
}
