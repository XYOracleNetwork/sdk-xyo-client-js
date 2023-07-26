import { assertEx } from '@xylabs/assert'
import { fulfilled, rejected } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { handleError, handleErrorAsync } from '@xyo-network/error'
import { AnyConfigSchema, ModuleConfig, ModuleErrorBuilder, ModuleQueryResult } from '@xyo-network/module'
import { ModuleError, Payload } from '@xyo-network/payload-model'
import { WitnessInstance } from '@xyo-network/witness'

import { AbstractSentinel } from './AbstractSentinel'
import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule, SentinelModuleEventData, SentinelParams } from './SentinelModel'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<
  AnyConfigSchema<TConfig>
>

export class MemorySentinel<
    TParams extends MemorySentinelParams = MemorySentinelParams,
    TEventData extends SentinelModuleEventData = SentinelModuleEventData,
  >
  extends AbstractSentinel<TParams, TEventData>
  implements SentinelModule<TParams, TEventData>
{
  static override configSchemas = [SentinelConfigSchema]

  async report(payloads: Payload[] = []): Promise<Payload[]> {
    await this.started('throw')
    const errors: Error[] = []
    await this.emit('reportStart', { inPayloads: payloads, module: this as SentinelModule })
    const allWitnesses = [...(await this.getWitnesses())]
    const resultPayloads: Payload[] = []

    try {
      const [generatedPayloads, generatedErrors] = await this.generateResults(allWitnesses)
      const combinedPayloads = [...generatedPayloads, ...payloads]
      resultPayloads.push(...combinedPayloads)
      errors.push(...generatedErrors)
    } catch (ex) {
      handleError(ex, (error) => {
        errors.push(error)
      })
    }

    const [[boundWitness]] = await this.bindQueryResult({ schema: SentinelReportQuerySchema }, resultPayloads)
    this.history.push(assertEx(boundWitness))
    await this.emit('reportEnd', { boundWitness, errors, inPayloads: payloads, module: this as SentinelModule, outPayloads: resultPayloads })
    return [boundWitness, ...resultPayloads]
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = Account.randomSync()
    const resultPayloads: Payload[] = []
    const errorPayloads: ModuleError[] = []
    try {
      switch (queryPayload.schema) {
        case SentinelReportQuerySchema: {
          resultPayloads.push(...(await this.report(payloads)))
          break
        }
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
    return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount], errorPayloads))[0]
  }

  private async generateResults(witnesses: WitnessInstance[]): Promise<[Payload[], Error[]]> {
    const results = await Promise.allSettled(witnesses?.map((witness) => witness.observe()))
    const payloads = results
      .filter(fulfilled)
      .map((result) => result.value)
      .flat()
    const errors = results
      .filter(rejected)
      .map((result) => result.reason)
      .flat()
    return [payloads, errors]
  }
}
