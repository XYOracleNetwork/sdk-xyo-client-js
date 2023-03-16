import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AbstractModule, ModuleConfig, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfigSchema } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { WitnessModule, WitnessModuleEventData, WitnessParams } from './Witness'

export class AbstractWitness<TParams extends WitnessParams = WitnessParams, TEventData extends WitnessModuleEventData = WitnessModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements WitnessModule<TParams, TEventData>
{
  static override configSchema: string = XyoWitnessConfigSchema

  override get queries(): string[] {
    return [XyoWitnessObserveQuerySchema, ...super.queries]
  }

  get targetSet() {
    return this.config?.targetSet
  }

  observe(payloads?: XyoPayload[]): Promisable<XyoPayload[]> {
    this.started('throw')
    const payloadList = assertEx(payloads, 'Trying to witness nothing')
    assertEx(payloadList.length > 0, 'Trying to witness empty list')
    payloadList?.forEach((payload) => assertEx(payload.schema, 'observe: Missing Schema'))
    //this.logger?.debug(`result: ${JSON.stringify(payloadList, null, 2)}`)
    return payloadList
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoWitnessQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    // Remove the query payload from the arguments passed to us so we don't observe it
    const filteredObservation = payloads?.filter((p) => new PayloadWrapper(p).hash !== query.query) || []
    const queryAccount = new Account()
    try {
      switch (typedQuery.schema) {
        case XyoWitnessObserveQuerySchema: {
          await this.emit('reportStart', { inPayloads: payloads, module: this })
          const resultPayloads = await this.observe(filteredObservation)
          await this.emit('reportEnd', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
          return this.bindResult(resultPayloads, queryAccount)
        }
        default: {
          return super.query(query, payloads)
        }
      }
    } catch (ex) {
      const error = ex as Error
      return this.bindResult([new XyoErrorBuilder([wrapper.hash], error.message).build()], queryAccount)
    }
  }
}
