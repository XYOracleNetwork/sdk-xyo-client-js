import { assertEx } from '@xylabs/assert'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { AbstractForecastingDiviner, DivinerWrapper, ForecastingDivinerConfigSchema } from '@xyo-network/diviner'
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
    // TODO: Get in batches based on window windowSize
    // TODO: Filter by address injected into config
    // TODO: Use bw diviner instead
    const bws = await (await this.params.boundWitnessSdk.find({ payload_schemas, timestamp: { $gte: startTimestamp, $lte: stopTimestamp } }))
      .sort({ timestamp: -1 })
      .limit(this.params.config.windowSize)
      .toArray()
    if (bws.length === 0) return []
    const hashes = bws.map((bw) => bw.payload_hashes[bw.payload_schemas.findIndex((s) => s === XyoEthereumGasSchema)])
    const archivistMod = assertEx((await this.upResolver.resolve(this.params.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)
    const payloads = await archivist.get(hashes)
    return payloads
  }

  protected override async stop(): Promise<this> {
    return await super.stop()
  }
}
