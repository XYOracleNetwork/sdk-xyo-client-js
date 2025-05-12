import type { Address } from '@xylabs/hex'
import { fulfilled, rejected } from '@xylabs/promise'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import type { AnyConfigSchema, ModuleIdentifier } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { AbstractSentinel } from '@xyo-network/sentinel-abstract'
import type {
  ResolvedTask,
  SentinelConfig,
  SentinelInstance,
  SentinelModuleEventData,
  SentinelParams,
} from '@xyo-network/sentinel-model'
import {
  asSentinelInstance,
  SentinelConfigSchema,
} from '@xyo-network/sentinel-model'
import { asWitnessInstance } from '@xyo-network/witness-model'

import { SentinelRunner } from './SentinelRunner.ts'

export type MemorySentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>> = SentinelParams<TConfig>

export class MemorySentinel<
  TParams extends MemorySentinelParams = MemorySentinelParams,
  TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
> extends AbstractSentinel<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, SentinelConfigSchema]
  static override readonly defaultConfigSchema: Schema = SentinelConfigSchema

  private runner?: SentinelRunner

  async reportHandler(inPayloads: Payload[] = []): Promise<Payload[]> {
    await this.started('throw')
    this.logger?.debug(`reportHandler:in: ${JSON.stringify(inPayloads)}`)
    const job = await this.jobPromise

    let index = 0
    let previousResults: Record<Address, Payload[]> = {}
    while (index < job.tasks.length) {
      const generatedPayloads = await this.runJob(job.tasks[index], previousResults, inPayloads)
      previousResults = generatedPayloads
      index++
    }
    const result = Object.values(previousResults).flat()
    this.logger?.debug(`reportHandler:out: ${JSON.stringify(result)}`)
    return result
  }

  override async startHandler(timeout?: number): Promise<boolean> {
    if (await super.startHandler(timeout)) {
      if ((this.config.automations?.length ?? 0) > 0) {
        this.runner = new SentinelRunner(this, this.config.automations)
        this.runner.start()
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

  private async inputAddresses(input: ModuleIdentifier | ModuleIdentifier[]): Promise<Address[]> {
    if (Array.isArray(input)) {
      return (await Promise.all(input.map(async inputItem => await this.inputAddresses(inputItem)))).flat()
    } else {
      const resolved = await this.resolve(input)
      return resolved ? [resolved.address] : []
    }
  }

  private processPreviousResults(payloads: Record<string, Payload[]>, inputs: string[]) {
    return inputs.flatMap(input => payloads[input] ?? [])
  }

  private async runJob(
    tasks: ResolvedTask[],
    previousResults: Record<Address, Payload[]>,
    inPayloads?: Payload[],
  ): Promise<Record<Address, Payload[]>> {
    await this.emit('jobStart', { inPayloads, mod: this })
    this.logger?.debug(`runJob:tasks: ${JSON.stringify(tasks.length)}`)
    this.logger?.debug(`runJob:previous: ${JSON.stringify(previousResults)}`)
    this.logger?.debug(`runJob:in: ${JSON.stringify(inPayloads)}`)
    const results: PromiseSettledResult<[Address, Payload[]]>[] = await Promise.allSettled(
      tasks?.map(async (task) => {
        const input = task.input ?? false
        const inPayloadsFound
          = input === true
            ? inPayloads
            : input === false
              ? []
              : this.processPreviousResults(previousResults, await this.inputAddresses(input))
        const witness = asWitnessInstance(task.mod)
        if (witness) {
          await this.emit('taskStart', {
            address: witness.address, inPayloads: inPayloadsFound, mod: this,
          })
          const observed = await witness.observe(inPayloadsFound)
          this.logger?.debug(`observed [${witness.id}]: ${JSON.stringify(observed)}`)
          await this.emit('taskEnd', {
            address: witness.address, inPayloads: inPayloadsFound, mod: this, outPayloads: observed,
          })
          return [witness.address, observed]
        }
        const diviner = asDivinerInstance(task.mod)
        if (diviner) {
          await this.emit('taskStart', {
            address: diviner.address, inPayloads: inPayloadsFound, mod: this,
          })
          const divined = await diviner.divine(inPayloadsFound)
          this.logger?.debug(`divined [${diviner.id}]: ${JSON.stringify(divined)}`)
          await this.emit('taskEnd', {
            address: diviner.address, inPayloads: inPayloadsFound, mod: this, outPayloads: divined,
          })
          return [diviner.address, divined]
        }
        const sentinel = asSentinelInstance(task.mod)
        if (sentinel) {
          await this.emit('taskStart', {
            address: sentinel.address, inPayloads: inPayloadsFound, mod: this,
          })
          const reported = await sentinel.report(inPayloadsFound)
          this.logger?.debug(`reported [${sentinel.id}]: ${JSON.stringify(reported)}`)
          await this.emit('taskEnd', {
            address: sentinel.address, inPayloads: inPayloadsFound, mod: this, outPayloads: reported,
          })
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
      const errors = results.filter(rejected).map(result => result.reason)
      if (errors.length > 0) {
        throw new Error('At least one module failed')
      }
    }
    this.logger?.debug(`generateResults:out: ${JSON.stringify(finalResult)}`)
    await this.emit('jobEnd', {
      finalResult, inPayloads, mod: this,
    })
    return finalResult
  }
}
