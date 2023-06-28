import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { PayloadHasher } from '@xyo-network/core'
import {
  AbstractModule,
  creatableModule,
  ModuleConfig,
  ModuleErrorBuilder,
  ModuleQueryResult,
  QueryBoundWitness,
  QueryBoundWitnessWrapper,
} from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { WitnessConfigSchema } from '@xyo-network/witness-model'
import { WitnessObserveQuerySchema, WitnessQuery, WitnessQueryBase } from '@xyo-network/witness-model'
import { WitnessModule, WitnessModuleEventData, WitnessParams } from '@xyo-network/witness-model'

creatableModule()
export class AbstractWitness<TParams extends WitnessParams = WitnessParams, TEventData extends WitnessModuleEventData = WitnessModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements WitnessModule<TParams, TEventData>
{
  static override configSchema: string = WitnessConfigSchema

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

  observe(payloads?: Payload[]): Promisable<Payload[]> {
    this.started('throw')
    const payloadList = assertEx(payloads, 'Trying to witness nothing')
    assertEx(payloadList.length > 0, 'Trying to witness empty list')
    payloadList?.forEach((payload) => assertEx(payload.schema, 'observe: Missing Schema'))
    return payloadList
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<WitnessQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    // Remove the query payload from the arguments passed to us so we don't observe it
    const filteredObservation = await PayloadHasher.filterExclude(payloads, query.query)
    const queryAccount = Account.random()
    try {
      switch (queryPayload.schema) {
        case WitnessObserveQuerySchema: {
          await this.emit('reportStart', { inPayloads: payloads, module: this })
          const resultPayloads = await this.observe(filteredObservation)
          await this.emit('reportEnd', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
          return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount]))[0]
        }
        default: {
          return super.queryHandler(query, payloads)
        }
      }
    } catch (ex) {
      const error = ex as Error
      const [result] = await this.bindQueryResult(
        queryPayload,
        [],
        [queryAccount],
        [
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        ],
      )
      return result
    }
  }
}
