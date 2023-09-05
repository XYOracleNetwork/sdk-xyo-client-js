import { assertEx } from '@xylabs/assert'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import {
  CustomDivinerModule,
  DivinerConfigSchema,
  DivinerDivineQuerySchema,
  DivinerModule,
  DivinerModuleEventData,
  DivinerParams,
  DivinerQuery,
  DivinerQueryBase,
} from '@xyo-network/diviner-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractDiviner<
    TParams extends DivinerParams = DivinerParams,
    TEventData extends DivinerModuleEventData<DivinerModule<TParams>> = DivinerModuleEventData<DivinerModule<TParams>>,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomDivinerModule<TParams, TEventData>
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

  /** @function divine The main entry point for a diviner.  Do not override this function.  Implement/override divineHandler for custom functionality */
  divine(payloads?: Payload[]): Promise<Payload[]> {
    this._noOverride('divine')
    return this.busy(async () => {
      await this.started('throw')
      await this.emit('divineStart', { inPayloads: payloads, module: this })
      const resultPayloads = await this.divineHandler(payloads)
      await this.emit('divineStart', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
      return resultPayloads
    })
  }

  /** @function queryHandler Calls divine for a divine query.  Override to support additional queries. */
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
        resultPayloads.push(...(await this.divine(cleanPayloads)))
        break
      default:
        return super.queryHandler(query, payloads)
    }
    return resultPayloads
  }

  /** @function divineHandler Implement or override to add custom functionality to a diviner */
  protected abstract divineHandler(payloads?: Payload[]): Promisable<Payload[]>
}
