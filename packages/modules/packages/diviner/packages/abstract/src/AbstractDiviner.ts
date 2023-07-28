import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import {
  DivinerConfigSchema,
  DivinerDivineQuerySchema,
  DivinerModule,
  DivinerModuleEventData,
  DivinerParams,
  DivinerQuery,
  DivinerQueryBase,
} from '@xyo-network/diviner-model'
import { AbstractModuleInstance, ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractDiviner<
    TParams extends DivinerParams = DivinerParams,
    TEventData extends DivinerModuleEventData = DivinerModuleEventData,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements DivinerModule<TParams>
{
  static override readonly configSchemas: string[] = [DivinerConfigSchema]
  static targetSchema: string

  override get queries(): string[] {
    return [DivinerDivineQuerySchema, ...super.queries]
  }

  protected override get _queryAccountPaths(): Record<DivinerQueryBase['schema'], string> {
    return {
      'network.xyo.query.diviner.divine': '1/1',
    }
  }

  divine(payloads?: Payload[]): Promise<Payload[]> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.divineHandler(payloads)
    })
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<DivinerQuery>(query, payloads)
    //remove the query payload
    const cleanPayloads = await PayloadHasher.filterExclude(payloads, query.query)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case DivinerDivineQuerySchema:
        await this.emit('reportStart', { inPayloads: payloads, module: this })
        resultPayloads.push(...(await this.divineHandler(cleanPayloads)))
        await this.emit('reportEnd', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
        break
      default:
        return super.queryHandler(query, payloads)
    }
    return resultPayloads
  }

  protected abstract divineHandler(payloads?: Payload[]): Promisable<Payload[]>
}
