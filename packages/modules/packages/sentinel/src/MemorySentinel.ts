import { assertEx } from '@xylabs/assert'
import { fulfilled, rejected } from '@xylabs/promise'
import { handleError } from '@xyo-network/error'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import {
  SentinelConfig,
  SentinelConfigSchema,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'
import { WitnessInstance } from '@xyo-network/witness'

import { AbstractSentinel } from './AbstractSentinel'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<
  AnyConfigSchema<TConfig>
>

export class MemorySentinel<
  TParams extends MemorySentinelParams = MemorySentinelParams,
  TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> extends AbstractSentinel<TParams, TEventData> {
  static override configSchemas = [SentinelConfigSchema]

  async reportHandler(payloads: Payload[] = []): Promise<Payload[]> {
    await this.started('throw')
    const errors: Error[] = []
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

    const [boundWitness] = await this.bindQueryResult({ schema: SentinelReportQuerySchema }, resultPayloads)
    this.history.push(assertEx(boundWitness))
    return [boundWitness, ...resultPayloads]
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
