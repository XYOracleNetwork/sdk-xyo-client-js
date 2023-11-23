import { Address } from '@xylabs/hex'
import { fulfilled } from '@xylabs/promise'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { AbstractSentinel } from '@xyo-network/sentinel-abstract'
import {
  ResolvedTask,
  SentinelConfig,
  SentinelConfigSchema,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
} from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

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
    tasks: ResolvedTask[],
    previousResults: Record<Address, Payload[]>,
    inPayloads?: Payload[],
  ): Promise<Record<Address, Payload[]>> {
    const results: PromiseSettledResult<[Address, Payload[]]>[] = await Promise.allSettled(
      tasks?.map(async (task) => {
        const witness = asWitnessInstance(task.module)
        const input = task.input ?? false
        const inPayloadsFound =
          input === true ? inPayloads : input === false ? [] : this.processPreviousResults(previousResults, await this.inputAddresses(input))
        if (witness) {
          return [witness.address, await witness.observe(inPayloadsFound)]
        }
        const diviner = asDivinerInstance(task.module)
        if (diviner) {
          return [diviner.address, await diviner.divine(inPayloadsFound)]
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
    /*const errors = results.filter(rejected).map((result) => result.reason)
    if (errors.length > 0) {
      throw Error('At least one module failed')
    }*/
    return finalResult
  }

  private async inputAddresses(input: string | string[]): Promise<string[]> {
    if (Array.isArray(input)) {
      return (await Promise.all(input.map(async (inputItem) => await this.inputAddresses(inputItem)))).flat()
    } else {
      const resolved = await this.resolve(input)
      return resolved ? [resolved.address] : []
    }
  }

  private processPreviousResults(payloads: Record<string, Payload[]>, inputs: string[]) {
    return inputs.map((input) => payloads[input] ?? []).flat()
  }
}
