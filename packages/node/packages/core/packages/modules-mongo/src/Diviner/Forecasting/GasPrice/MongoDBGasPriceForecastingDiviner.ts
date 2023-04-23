import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { AbstractForecastingDiviner, ForecastingDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { Job, JobProvider } from '@xyo-network/shared'

import { defineJobs, scheduleJobs } from '../../../JobQueue'
import { MongoDBForecastingDivinerParams } from '../MongoDBForecastingDiviner'

export class MongoDBGasPriceForecastingDiviner<TParams extends MongoDBForecastingDivinerParams = MongoDBForecastingDivinerParams>
  extends AbstractForecastingDiviner<TParams>
  implements JobProvider
{
  static override configSchema = ForecastingDivinerConfigSchema

  /**
   * The max number of records to search during the batch query
   */
  protected readonly batchLimit = 1_000

  protected readonly forecastingDataAddress = 'TODO'
  protected readonly forecastingDataSchema = XyoEthereumGasSchema

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

  // TODO: Start/stop ambiguity (which is first/last, recent/past)
  protected override async getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promise<Payload[]> {
    const payload_schemas = XyoEthereumGasSchema
    // TODO: Filter by address injected into config
    // TODO: Filter by payload_schema injected into config
    // TODO: Use bw diviner instead

    // Set the initial skip value to 0
    let skip = 0

    // Flag to indicate whether or not there are more BWs to process
    let more = true

    const payloads: Payload[] = []

    // Loop until there are no more BWs to process or we've got enough to satisfy the training window
    while (more || payloads.length < this.config.windowSize) {
      const addresses = this.forecastingDataAddress
      const bws = await (
        await this.params.boundWitnessSdk.find({ addresses, payload_schemas, timestamp: { $gte: startTimestamp, $lte: stopTimestamp } })
      )
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(this.batchLimit)
        .toArray()

      // Update the skip value for the next batch
      skip += this.batchLimit

      // Set the more flag to false if there are fewer documents returned than the batch size
      more = bws.length === this.batchLimit

      if (bws.length === 0) return []
      const hashes = bws.map((bw) => bw.payload_hashes[bw.payload_schemas.findIndex((s) => s === this.forecastingDataSchema)])
      const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
      const archivist = ArchivistWrapper.wrap(archivistMod)
      payloads.push((await archivist.get(hashes))[1])
    }
    return payloads
  }

  protected override async stop(): Promise<this> {
    return await super.stop()
  }
}
