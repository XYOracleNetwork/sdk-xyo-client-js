import { Address } from '@xylabs/hex'
import { fulfilled, rejected } from '@xylabs/promise'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { AbstractSentinel } from '@xyo-network/sentinel-abstract'
import {
  asSentinelInstance,
  ResolvedTask,
  SentinelConfig,
  SentinelConfigSchema,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
} from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { SentinelRunner } from './SentinelRunner'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<TConfig>

export class MemorySentinel<
  TParams extends MemorySentinelParams = MemorySentinelParams,
  TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> extends AbstractSentinel<TParams, TEventData> {
  static override configSchemas = [SentinelConfigSchema]

  private runner?: SentinelRunner

  async reportHandler(inPayloads: Payload[] = []): Promise<Payload[]> {
    await this.started('throw')
    this.logger?.debug(`reportHandler:in: ${JSON.stringify(inPayloads)}`)
    const job = await this.jobPromise

    let index = 0
    let previousResults: Record<Address, Payload[]> = {}
    while (index < job.tasks.length) {
      const generatedPayloads = await this.generateResults(job.tasks[index], previousResults, inPayloads)
      previousResults = generatedPayloads
      index++
    }
    const result = Object.values(previousResults).flat()
    this.logger?.debug(`reportHandler:out: ${JSON.stringify(result)}`)
    return result
  }

  override async start(timeout?: number | undefined): Promise<boolean> {
    if (await super.start(timeout)) {
      if ((this.config.automations?.length ?? 0) > 0) {
        this.runner = new SentinelRunner(this, this.config.automations)
        await this.runner.start()
      }
      return true
    }
    return false
  }

  override async stop(timeout?: number | undefined): Promise<boolean> {
    if (this.runner) {
      this.runner.stop()
      this.runner = undefined
    }
    return await super.stop(timeout)
  }

  private async generateResults(
    tasks: ResolvedTask[],
    previousResults: Record<Address, Payload[]>,
    inPayloads?: Payload[],
  ): Promise<Record<Address, Payload[]>> {
    this.logger?.debug(`generateResults:tasks: ${JSON.stringify(tasks.length)}`)
    this.logger?.debug(`generateResults:previous: ${JSON.stringify(previousResults)}`)
    this.logger?.debug(`generateResults:in: ${JSON.stringify(inPayloads)}`)
    const results: PromiseSettledResult<[Address, Payload[]]>[] = await Promise.allSettled(
      tasks?.map(async (task) => {
        const input = task.input ?? false
        const inPayloadsFound =
          input === true ? inPayloads : input === false ? [] : this.processPreviousResults(previousResults, await this.inputAddresses(input))
        const witness = asWitnessInstance(task.module)
        if (witness) {
          const observed = await witness.observe(inPayloadsFound)
          this.logger?.debug(`observed [${witness.id}]: ${JSON.stringify(observed)}`)
          return [witness.address, observed]
        }
        const diviner = asDivinerInstance(task.module)
        if (diviner) {
          const divined = await diviner.divine(inPayloadsFound)
          this.logger?.debug(`divined [${diviner.id}]: ${JSON.stringify(divined)}`)
          return [diviner.address, divined]
        }
        const sentinel = asSentinelInstance(task.module)
        if (sentinel) {
          const reported = await sentinel.report(inPayloadsFound)
          this.logger?.debug(`reported [${sentinel.id}]: ${JSON.stringify(reported)}`)
          return [sentinel.address, reported]
        }
        throw new Error('Unsupported module type')
      }),
    )
    const finalResult: Record<Address, Payload[]> = {}
    for (const result of results.filter(fulfilled)) {
      const [address, payloads] = result.value
      finalResult[address] = finalResult[address] ?? []
      finalResult[address].push(...payloads)
    }
    if (this.throwErrors) {
      const errors = results.filter(rejected).map((result) => result.reason)
      if (errors.length > 0) {
        throw new Error('At least one module failed')
      }
    }
    this.logger?.debug(`generateResults:out: ${JSON.stringify(finalResult)}`)
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
    return inputs.flatMap((input) => payloads[input] ?? [])
  }
}
