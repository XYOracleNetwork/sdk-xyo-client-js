import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import {
  DivinerConfigSchema,
  DivinerDivineQuerySchema,
  DivinerModuleEventData,
  DivinerParams,
  DivinerQuery,
  DivinerQueryBase,
  IndirectDivinerModule,
} from '@xyo-network/diviner-model'
import { handleErrorAsync } from '@xyo-network/error'
import { AbstractModule, ModuleConfig, ModuleErrorBuilder, ModuleQueryResult } from '@xyo-network/module'
import { ModuleError, Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export abstract class AbstractIndirectDiviner<
    TParams extends DivinerParams = DivinerParams,
    TEventData extends DivinerModuleEventData = DivinerModuleEventData,
  >
  extends AbstractModule<TParams, TEventData>
  implements IndirectDivinerModule<TParams>
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

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<DivinerQuery>(query, payloads)
    //remove the query payload
    const cleanPayloads = await PayloadHasher.filterExclude(payloads, query.query)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = this.ephemeralQueryAccountEnabled ? await HDWallet.random() : undefined
    const resultPayloads: Payload[] = []
    const errorPayloads: ModuleError[] = []
    try {
      switch (queryPayload.schema) {
        case DivinerDivineQuerySchema:
          await this.emit('reportStart', { inPayloads: payloads, module: this })
          resultPayloads.push(...(await this.divineHandler(cleanPayloads)))
          await this.emit('reportEnd', { inPayloads: payloads, module: this, outPayloads: resultPayloads })
          break
        default:
          return super.queryHandler(query, payloads)
      }
    } catch (ex) {
      await handleErrorAsync(ex, async (error) => {
        errorPayloads.push(
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        )
      })
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, queryAccount ? [queryAccount] : [], errorPayloads))[0]
  }

  protected abstract divineHandler(payloads?: Payload[]): Promisable<Payload[]>
}

export abstract class AbstractDiviner<
  TParams extends DivinerParams = DivinerParams,
  TEventData extends DivinerModuleEventData = DivinerModuleEventData,
> extends AbstractIndirectDiviner<TParams, TEventData> {}
