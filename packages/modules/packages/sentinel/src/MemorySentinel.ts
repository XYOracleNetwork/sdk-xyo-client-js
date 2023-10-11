import { assertEx } from '@xylabs/assert'
import { fulfilled, rejected } from '@xylabs/promise'
import { handleError } from '@xyo-network/error'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import {
  SentinelConfig,
  SentinelConfigSchema,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'
import { WitnessInstance } from '@xyo-network/witness-model'

import { AbstractSentinel } from './AbstractSentinel'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<TConfig>

export class MemorySentinel<
  TParams extends MemorySentinelParams = MemorySentinelParams,
  TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> extends AbstractSentinel<TParams, TEventData> {
  static override configSchemas = [SentinelConfigSchema]

  async reportHandler(payloads: Payload[] = []): Promise<Payload[]> {
    await this.started('throw')
    const errors: Error[] = []
    const allWitnesses = [...(await this.witnesses())]
    const resultPayloads: Payload[] = []

    try {
      const [generatedPayloads, generatedErrors] = await this.generateResults(allWitnesses, payloads)
      resultPayloads.push(...generatedPayloads)
      errors.push(...generatedErrors)
      if (this.config.passthrough) {
        resultPayloads.push(...payloads)
      }
    } catch (ex) {
      handleError(ex, (error) => {
        errors.push(error)
      })
    }

    const [boundWitness] = await this.bindQueryResult({ schema: SentinelReportQuerySchema }, resultPayloads)
    this.history.push(assertEx(boundWitness))
    return [boundWitness, ...resultPayloads]
  }

  private async generateResults(witnesses: WitnessInstance[], inPayloads?: Payload[]): Promise<[Payload[], Error[]]> {
    const results: PromiseSettledResult<Payload[]>[] = await Promise.allSettled(witnesses?.map((witness) => witness.observe(inPayloads)))
    const payloads = results
      .filter(fulfilled)
      .map((result) => result.value)
      .flat()
    const errors = results
      .filter(rejected)
      .map((result) => result.reason)
      .flat()
    // console.log(`payloads: ${JSON.stringify(payloads, null, 2)}`)
    // console.log(`errors: ${JSON.stringify(errors, null, 2)}`)
    return [payloads, errors]
  }
}
