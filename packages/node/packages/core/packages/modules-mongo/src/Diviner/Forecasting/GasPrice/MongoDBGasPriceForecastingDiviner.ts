import { AbstractForecastingDiviner, ForecastingDivinerConfigSchema } from '@xyo-network/diviner'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { Job, JobProvider } from '@xyo-network/shared'

import { defineJobs, scheduleJobs } from '../../../JobQueue'
import { MongoDBForecastingDivinerParams } from '../MongoDBForecastingDiviner'

export class MongoDBGasPriceForecastingDiviner<TParams extends MongoDBForecastingDivinerParams = MongoDBForecastingDivinerParams>
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

  protected override getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]> {
    throw new Error('')
  }

  protected override async stop(): Promise<this> {
    return await super.stop()
  }
}
