import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import {
  AbstractForecastingDiviner,
  ForecastingDivinerConfigSchema,
  ForecastingDivinerParams,
  ForecastingMethod,
  PayloadValueTransformer,
} from '@xyo-network/diviner'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { value } from 'jsonpath'
import { Filter } from 'mongodb'

import { defineJobs, scheduleJobs } from '../../JobQueue'

export type MongoDBForecastingDivinerParams = ForecastingDivinerParams & {
  boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  jobQueue: JobQueue
  payloadSdk: BaseMongoSdk<PayloadWithMeta>
}

const jsonPathTransformer: PayloadValueTransformer = (x: Payload): number => {
  const ret = value(x, '')
  if (typeof ret === 'number') return ret
  throw new Error('Parsed invalid payload value')
}

const getJsonPathTransformer = (pathExpression: string): PayloadValueTransformer => {
  const transformer = (x: Payload): number => {
    const ret = value(x, pathExpression)
    if (typeof ret === 'number') return ret
    throw new Error('Parsed invalid payload value')
  }
  return transformer
}

export class MongoDBForecastingDiviner<TParams extends MongoDBForecastingDivinerParams = MongoDBForecastingDivinerParams>
  extends AbstractForecastingDiviner<TParams>
  implements JobProvider
{
  static override configSchema = ForecastingDivinerConfigSchema

  /**
   * The max number of records to search during the batch query
   */
  protected readonly batchLimit = 1_000

  // TODO: Inject via config
  protected readonly maxTrainingLength = 10_000

  get jobs(): Job[] {
    return []
  }

  protected override get forecastingMethod(): ForecastingMethod {
    throw new Error('Method not implemented.')
  }
  protected override get transformer(): PayloadValueTransformer {
    throw new Error('Method not implemented.')
  }

  override async start() {
    await super.start()
    if (this.jobs.length > 0) {
      const { jobQueue } = this.params
      defineJobs(jobQueue, this.jobs)
      jobQueue.once('ready', async () => await scheduleJobs(jobQueue, this.jobs))
    }
  }

  protected override async getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promise<Payload[]> {
    const addresses = this.config.witnessAddresses
    const payload_schemas = this.config.witnessSchema
    const payloads: Payload[] = []
    const archivistMod = assertEx((await this.upResolver.resolve(this.config.archivist)).pop(), 'Unable to resolve archivist')
    const archivist = ArchivistWrapper.wrap(archivistMod)

    let skip = 0
    let more = true

    // TODO: Window size vs sample size
    // Loop until there are no more BWs to process or we've got enough payloads to satisfy the training window
    while (more || payloads.length < this.maxTrainingLength) {
      const filter: Filter<BoundWitnessWithMeta> = { addresses, payload_schemas, timestamp: { $gte: startTimestamp, $lte: stopTimestamp } }
      // TODO: Use bw diviner instead
      const boundWitnesses = await (await this.params.boundWitnessSdk.find(filter))
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(this.batchLimit)
        .toArray()

      // Update the skip value for the next batch
      skip += this.batchLimit

      // Set the more flag to false if there are fewer documents returned than the batch size
      more = boundWitnesses.length === this.batchLimit

      // Get the payloads from the BWs
      const hashes = boundWitnesses
        .map((bw) => bw.payload_hashes[bw.payload_schemas.findIndex((s) => s === this.config.witnessSchema)])
        .filter(exists)

      // Get the payloads corresponding to the BW hashes from the archivist
      if (hashes.length === 0) {
        const batchPayloads = (await archivist.get(hashes))[1]
        payloads.push(batchPayloads)
      }
    }
    return payloads
  }
}
