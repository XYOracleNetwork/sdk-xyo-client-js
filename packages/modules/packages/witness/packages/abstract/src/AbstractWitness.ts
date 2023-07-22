import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { handleErrorAsync } from '@xyo-network/error'
import { AbstractModuleInstance, creatableModule, ModuleConfig, ModuleErrorBuilder, ModuleQueryResult } from '@xyo-network/module'
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

  async observe(payloads?: Payload[]): Promise<Payload[]> {
    await this.started('throw')
    const payloadList = assertEx(await this.observeHandler(payloads), 'Trying to witness nothing')
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
    const queryAccount = this.ephemeralQueryAccountEnabled ? await HDWallet.random() : undefined
    try {
      switch (queryPayload.schema) {
        case WitnessObserveQuerySchema: {
          await this.emit('reportStart', { inPayloads: payloads, module: this })
          const resultPayloads = await this.observe(filteredObservation)
          await this.emit('reportEnd', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
          return (await this.bindQueryResult(queryPayload, resultPayloads, queryAccount ? [queryAccount] : []))[0]
        }
        default: {
          return super.queryHandler(query, payloads)
        }
      }
    } catch (ex) {
      return handleErrorAsync(ex, async (error) => {
        const [result] = await this.bindQueryResult(queryPayload, [], queryAccount ? [queryAccount] : [], [
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        ])
        return result
      })
    }
  }

  protected abstract observeHandler(payloads?: Payload[]): Promisable<Payload[]>
}
