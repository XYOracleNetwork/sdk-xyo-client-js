import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import { globallyUnique } from '@xylabs/object'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness, isBoundWitness, notBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import {
  CustomSentinelInstance,
  ResolvedTask,
  SentinelInstance,
  SentinelJob,
  SentinelModuleEventData,
  SentinelParams,
  SentinelQueries,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'

export abstract class AbstractSentinel<
    TParams extends SentinelParams = SentinelParams,
    TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomSentinelInstance<TParams, TEventData>
{
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

  protected override get _queryAccountPaths(): Record<SentinelQueries['schema'], string> {
    return {
      'network.xyo.query.sentinel.report': '1/1',
    }
  }

  async report(inPayloads?: Payload[]): Promise<Payload[]> {
    this._noOverride('report')
    const reportPromise = (async () => {
      await this.emit('reportStart', { inPayloads, module: this })
      const payloads = await this.reportHandler(inPayloads)

      //create boundwitness
      const result = (await (await new BoundWitnessBuilder().payloads(payloads)).witness(this.account).build()).flat()

      if (this.config.archiving) {
        await this.storeToArchivists(result)
      }

      await this.emitReportEnd(inPayloads, result)
      return result
    })()
    if (this.synchronous) {
      return await reportPromise
    } else {
      forget(reportPromise)
      return []
    }
  }

  protected async emitReportEnd(inPayloads?: Payload[], payloads?: Payload[]) {
    const boundwitnesses = payloads?.filter(isBoundWitness) ?? []
    const outPayloads = payloads?.filter(notBoundWitness) ?? []
    const boundwitness = boundwitnesses.find((bw) => bw.addresses.includes(this.address))
    await this.emit('reportEnd', { boundwitness, inPayloads, module: this, outPayloads })
  }

  protected async generateJob() {
    const job: SentinelJob = { tasks: [] }
    let tasks: ResolvedTask[] = await Promise.all(
      this.config.tasks.map(async (task) => ({
        input: task.input ?? false,
        module: assertEx(await this.resolve(task.module), () => `Unable to resolve task module [${task.module}]`),
      })),
    )
    while (tasks.length > 0) {
      const previousTasks = job.tasks.at(-1) ?? []
      const newListCandidates =
        //add all tasks that either require no previous input or have the previous input module already added
        tasks.filter((task) => {
          const input = task.input
          if (input === undefined) {
            return true
          }
          if (typeof input === 'boolean') {
            return true
          }
          if (typeof input === 'string') {
            return previousTasks.find((prevTask) => prevTask.module.address === input || prevTask.module.config.name === input)
          }
          if (Array.isArray(input)) {
            return previousTasks.find(
              (prevTask) => input.includes(prevTask.module.address) || input.includes(prevTask.module.config.name ?? prevTask.module.address),
            )
          }
        })
      //remove any tasks that have inputs that are in the current list or the remaining tasks
      const newList = newListCandidates.filter((taskCandidate) => {
        const input = taskCandidate.input
        if (
          Array.isArray(input) &&
          tasks.some(
            (remainingTask) =>
              input.includes(remainingTask.module.address) || input.includes(remainingTask.module.config.name ?? remainingTask.module.address),
          )
        ) {
          return false
        }
        return true
      })
      assertEx(newList.length > 0, () => `Unable to generateJob [${tasks.length}]`)
      job.tasks.push(newList)
      //remove the tasks we just added
      tasks = tasks.filter((task) => !newList.includes(task))
    }
    return job
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<SentinelQueries>(query, payloads)
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
    return resultPayloads
  }

  abstract reportHandler(payloads?: Payload[]): Promise<Payload[]>
}
