import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import { forget } from '@xylabs/forget'
import { spanAsync } from '@xylabs/telemetry'
import type { AccountInstance } from '@xyo-network/account-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness, notBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import type {
  ModuleConfig, ModuleQueryHandlerResult, ModuleQueryResult,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  Payload, Schema, WithoutPrivateStorageMeta,
} from '@xyo-network/payload-model'
import type {
  AttachableSentinelInstance,
  CustomSentinelInstance,
  ResolvedTask,
  SentinelInstance,
  SentinelJob,
  SentinelModuleEventData,
  SentinelParams,
  SentinelQueries,
  SentinelReportQuery,
} from '@xyo-network/sentinel-model'
import {
  SentinelConfigSchema,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'

export abstract class AbstractSentinel<
  TParams extends SentinelParams = SentinelParams,
  TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
>
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomSentinelInstance<TParams, TEventData>, AttachableSentinelInstance<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, SentinelConfigSchema]
  static override readonly defaultConfigSchema: Schema = SentinelConfigSchema
  static override readonly uniqueName = globallyUnique('AbstractSentinel', AbstractSentinel, 'xyo')
  history: BoundWitness[] = []
  private _jobPromise?: Promise<SentinelJob>

  get jobPromise() {
    this._jobPromise = this._jobPromise ?? this.generateJob()
    return this._jobPromise
  }

  override get queries(): string[] {
    return [SentinelReportQuerySchema, ...super.queries]
  }

  get synchronous(): boolean {
    return this.config.synchronous ?? false
  }

  get throwErrors(): boolean {
    return this.config.throwErrors ?? true
  }

  async report(inPayloads?: Payload[]): Promise<WithoutPrivateStorageMeta<Payload>[]> {
    this._noOverride('report')
    this.isSupportedQuery(SentinelReportQuerySchema, 'report')
    return await spanAsync('report', async () => {
      if (this.reentrancy?.scope === 'global' && this.reentrancy.action === 'skip' && this.globalReentrancyMutex?.isLocked()) {
        return []
      }
      try {
        await this.globalReentrancyMutex?.acquire()
        const reportPromise = (async () => {
          await this.emit('reportStart', { inPayloads, mod: this })
          const payloads = await this.reportHandler(inPayloads)

          // create boundwitness
          const result = (await new BoundWitnessBuilder().payloads(payloads).signer(this.account).build()).flat()

          if (this.config.archiving) {
            forget(this.storeToArchivists(result), { name: `AbstractSentinel.report.storeArchivist [${this.id}]` })
          }

          await this.emitReportEnd(inPayloads, result)
          return result
        })()
        if (this.synchronous) {
          return await reportPromise
        } else {
          forget(reportPromise, { name: `AbstractSentinel.report [${this.id}]` })
          return []
        }
      } finally {
        this.globalReentrancyMutex?.release()
      }
    }, this.tracer)
  }

  async reportQuery(payloads?: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    this._noOverride('reportQuery')
    this.isSupportedQuery(SentinelReportQuerySchema, 'reportQuery')
    const queryPayload: SentinelReportQuery = { schema: SentinelReportQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }

  protected async emitReportEnd(inPayloads?: Payload[], payloads?: Payload[]) {
    const boundwitnesses = payloads?.filter(isBoundWitness) ?? []
    const outPayloads = payloads?.filter(notBoundWitness) ?? []
    const boundwitness = boundwitnesses.find(bw => bw.addresses.includes(this.address))
    await this.emit('reportEnd', {
      boundwitness, inPayloads, mod: this, outPayloads,
    })
  }

  protected async generateJob() {
    const job: SentinelJob = { tasks: [] }
    let tasks: ResolvedTask[] = await Promise.all(
      this.config.tasks.map(async task => ({
        input: task.input ?? false,
        mod: assertEx(await this.resolve(task.mod), () => `Unable to resolve task module [${task.mod}]`),
      })),
    )
    while (tasks.length > 0) {
      const previousTasks = job.tasks.at(-1) ?? []
      const newListCandidates
        // add all tasks that either require no previous input or have the previous input module already added
        = tasks.filter((task) => {
          const input = task.input
          if (input === undefined) {
            return true
          }
          if (typeof input === 'boolean') {
            return true
          }
          if (typeof input === 'string') {
            return previousTasks.some(prevTask => prevTask.mod.address === input || prevTask.mod.modName === input)
          }
          if (Array.isArray(input)) {
            return previousTasks.some(
              prevTask => input.includes(prevTask.mod.address) || input.includes(prevTask.mod.modName ?? prevTask.mod.address),
            )
          }
          return false
        })
      // remove any tasks that have inputs that are in the current list or the remaining tasks
      const newList = newListCandidates.filter((taskCandidate) => {
        const input = taskCandidate.input
        return !(
          Array.isArray(input)
          && tasks.some(
            remainingTask => input.includes(remainingTask.mod.address) || input.includes(remainingTask.mod.modName ?? remainingTask.mod.address),
          )
        )
      })
      assertEx(newList.length > 0, () => `Unable to generateJob [${tasks.length}]`)
      job.tasks.push(newList)
      // remove the tasks we just added
      tasks = tasks.filter(task => !newList.includes(task))
    }
    return job
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case SentinelReportQuerySchema: {
        resultPayloads.push(...(await this.report(payloads)))
        break
      }
      default: {
        return super.queryHandler(query, payloads)
      }
    }
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads)
  }

  abstract reportHandler(payloads?: Payload[]): Promise<Payload[]>
}
