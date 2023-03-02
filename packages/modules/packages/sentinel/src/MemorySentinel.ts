import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleConfig, ModuleQueryResult, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { WitnessWrapper } from '@xyo-network/witness'
import compact from 'lodash/compact'

import { AbstractSentinel, SentinelParams } from './AbstractSentinel'
import { SentinelConfig, SentinelConfigSchema } from './Config'
import { SentinelQuery, SentinelReportQuerySchema } from './Queries'
import { SentinelModule } from './SentinelModel'

export type MemorySentinelParams<TConfig extends SentinelConfig = SentinelConfig> = SentinelParams<
  TConfig,
  {
    onReportEnd?: (boundWitness?: XyoBoundWitness, errors?: Error[]) => void
    onReportStart?: () => void
    onWitnessReportEnd?: (witness: WitnessWrapper, error?: Error) => void
    onWitnessReportStart?: (witness: WitnessWrapper) => void
  }
>

export class MemorySentinel<TParams extends MemorySentinelParams = MemorySentinelParams>
  extends AbstractSentinel<TParams>
  implements SentinelModule<TParams['config']>
{
  static override configSchema: SentinelConfigSchema

  static override async create(params?: MemorySentinelParams): Promise<MemorySentinel> {
    return (await super.create(params)) as MemorySentinel
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQuery>(query, payloads)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query, payloads, queryConfig))
    const queryAccount = new Account()
    const resultPayloads: XyoPayload[] = []
    try {
      switch (typedQuery.schemaName) {
        case SentinelReportQuerySchema: {
          resultPayloads.push(...(await this.report(payloads)))
          break
        }
        default:
          return super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }

  async report(payloads: XyoPayload[] = []): Promise<XyoPayload[]> {
    const errors: Error[] = []
    this.params?.onReportStart?.()
    const allWitnesses = [...(await this.getWitnesses())]
    const allPayloads: XyoPayload[] = []

    try {
      const generatedPayloads = compact(await this.generatePayloads(allWitnesses))
      const combinedPayloads = [...generatedPayloads, ...payloads]
      allPayloads.push(...combinedPayloads)
    } catch (e) {
      errors.push(e as Error)
    }

    const [newBoundWitness] = await this.bindResult(allPayloads)
    this.history.push(assertEx(newBoundWitness))
    this.params?.onReportEnd?.(newBoundWitness, errors.length > 0 ? errors : undefined)
    return [newBoundWitness, ...allPayloads]
  }

  private async generatePayloads(witnesses: WitnessWrapper[]): Promise<XyoPayload[]> {
    return (await Promise.all(witnesses?.map(async (witness) => await witness.observe()))).flat()
  }
}
