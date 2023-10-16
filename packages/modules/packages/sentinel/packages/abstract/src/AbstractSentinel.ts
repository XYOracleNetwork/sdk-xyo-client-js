import { assertEx } from '@xylabs/assert'
import { forget } from '@xylabs/forget'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness, isBoundWitness, notBoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleConfig, ModuleQueryHandlerResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import {
  CustomSentinelInstance,
  ResolvedSentinelTask,
  SentinelInstance,
  SentinelJob,
  SentinelModuleEventData,
  SentinelParams,
  SentinelQueryBase,
  SentinelReportQuerySchema,
} from '@xyo-network/sentinel-model'

export abstract class AbstractSentinel<
    TParams extends SentinelParams = SentinelParams,
    TEventData extends SentinelModuleEventData<SentinelInstance<TParams>> = SentinelModuleEventData<SentinelInstance<TParams>>,
  >
  extends AbstractModuleInstance<TParams, TEventData>
  implements CustomSentinelInstance<TParams, TEventData>
{
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

  protected override get _queryAccountPaths(): Record<SentinelQueryBase['schema'], string> {
    return {
      'network.xyo.query.sentinel.report': '1/1',
    }
  }

  async report(inPayloads?: Payload[]): Promise<Payload[]> {
    this._noOverride('report')
    const reportPromise = (async () => {
      await this.emit('reportStart', { inPayloads, module: this })
      const payloads = await this.reportHandler(inPayloads)
      await this.emitReportEnd(inPayloads, payloads)
      return payloads
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
    let tasks: ResolvedSentinelTask[] = await Promise.all(
      this.config.tasks.map(async (task) => ({
        input: task.input ?? false,
        module: assertEx(await this.resolve(task.module), `Unable to resolve task module [${task.module}]`),
      })),
    )
    while (tasks.length) {
      const previousTasks = job.tasks.length ? job.tasks[job.tasks.length - 1] : []
      const newList =
        //add all tasks that either require no previous input or have the previous input module already added
        tasks.filter(
          (task) =>
            typeof task.input === 'boolean' ||
            previousTasks.find((prevTask) => prevTask.module.address === task.input || prevTask.module.config.name === task.input),
        )
      assertEx(newList.length > 0, `Unable to generateJob [${tasks.length}]`)
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
    const wrapper = QueryBoundWitnessWrapper.parseQuery<SentinelQueryBase>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
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
