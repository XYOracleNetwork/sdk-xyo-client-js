import { AbstractForecastingDiviner, ForecastingDivinerConfigSchema, ForecastingDivinerParams } from '@xyo-network/diviner'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'

import { defineJobs, scheduleJobs } from '../../JobQueue'

export type MongoDBForecastingDivinerParams = ForecastingDivinerParams & {
  boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  jobQueue: JobQueue
  payloadSdk: BaseMongoSdk<PayloadWithMeta>
}

export abstract class MongoDBForecastingDiviner<TParams extends MongoDBForecastingDivinerParams = MongoDBForecastingDivinerParams>
  extends AbstractForecastingDiviner<TParams>
  implements JobProvider
{
  static override configSchema = ForecastingDivinerConfigSchema

  get jobs(): Job[] {
    return []
  }

  override async start() {
    await super.start()
    if (this.jobs.length > 0) {
      const { jobQueue } = this.params
      defineJobs(jobQueue, this.jobs)
      jobQueue.once('ready', async () => await scheduleJobs(jobQueue, this.jobs))
    }
  }

  protected override async stop(): Promise<this> {
    return await super.stop()
  }

  protected abstract override getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
