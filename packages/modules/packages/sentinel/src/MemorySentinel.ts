import { fulfilled, rejected } from '@xylabs/promise'
import { Address } from '@xyo-network/core'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import {
  ResolvedSentinelTask,
  SentinelConfig,
  SentinelConfigSchema,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
} from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { AbstractSentinel } from './AbstractSentinel'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<TConfig>

export class MemorySentinel<
  TParams extends MemorySentinelParams = MemorySentinelParams,
  TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> extends AbstractSentinel<TParams, TEventData> {
  static override configSchemas = [SentinelConfigSchema]

  async reportHandler(inPayloads: Payload[] = []): Promise<Payload[]> {
    await this.started('throw')
    const job = await this.jobPromise

    let index = 0
    let previousResults: Record<Address, Payload[]> = {}
    while (index < job.tasks.length) {
      const generatedPayloads = await this.generateResults(job.tasks[index], previousResults, inPayloads)
      previousResults = generatedPayloads
      index++
    }
    return Object.values(previousResults).flat()
  }

  private async generateResults(
    tasks: ResolvedSentinelTask[],
    previousResults: Record<Address, Payload[]>,
    inPayloads?: Payload[],
  ): Promise<Record<Address, Payload[]>> {
    const results: PromiseSettledResult<[Address, Payload[]]>[] = await Promise.allSettled(
      tasks?.map(async (task) => {
        const witness = asWitnessInstance(task.module)
        const input = task.input ?? false
        if (witness) {
          return [witness.address, await witness.observe(input === true ? inPayloads : input === false ? [] : previousResults[input])]
        }
        const diviner = asDivinerInstance(task.module)
        if (diviner) {
          return [diviner.address, await diviner.divine(input === true ? inPayloads : input === false ? [] : previousResults[input])]
        }
        throw Error('Unsupported module type')
      }),
    )
    const finalResult: Record<Address, Payload[]> = {}
    results.filter(fulfilled).forEach((result) => {
      const [address, payloads] = result.value
      finalResult[address] = finalResult[address] ?? []
      finalResult[address].push(...payloads)
    })
    const errors = results.filter(rejected).map((result) => result.reason)
    if (errors.length > 0) {
      throw Error('At least one module failed')
    }
    return finalResult
  }
}
