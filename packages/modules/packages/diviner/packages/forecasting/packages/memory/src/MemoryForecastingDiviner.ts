import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { AbstractForecastingDiviner, ForecastingDivinerParams } from '@xyo-network/diviner-forecasting-abstract'
import {
  arimaForecastingMethod,
  arimaForecastingName,
  seasonalArimaForecastingMethod,
  seasonalArimaForecastingName,
} from '@xyo-network/diviner-forecasting-method-arima'
import { ForecastingDivinerConfigSchema, ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner-forecasting-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

export type SupportedForecastingType = typeof arimaForecastingName | typeof seasonalArimaForecastingName

const getJsonPathTransformer = (pathExpression: string): PayloadValueTransformer => {
  const transformer = (x: Payload): number => {
    // eslint-disable-next-line import/no-named-as-default-member
    const ret = jsonpath.value(x, pathExpression)
    if (typeof ret === 'number') return ret
    throw new Error('Parsed invalid payload value')
  }
  return transformer
}

export class MemoryForecastingDiviner<
  TParams extends ForecastingDivinerParams = ForecastingDivinerParams,
> extends AbstractForecastingDiviner<TParams> {
  static override configSchemas = [ForecastingDivinerConfigSchema]

  protected static readonly forecastingMethodDict: Record<SupportedForecastingType, ForecastingMethod> = {
    arimaForecasting: arimaForecastingMethod,
    seasonalArimaForecasting: seasonalArimaForecastingMethod,
  }

  /**
   * The max number of records to search during the batch query
   */
  protected readonly batchLimit = 1_000

  // TODO: Inject via config
  protected readonly maxTrainingLength = 10_000

  protected override get forecastingMethod(): ForecastingMethod {
    const forecastingMethodName = assertEx(this.config.forecastingMethod, 'Missing forecastingMethod in config') as SupportedForecastingType
    const forecastingMethod = MemoryForecastingDiviner.forecastingMethodDict[forecastingMethodName]
    if (forecastingMethod) return forecastingMethod
    throw new Error(`Unsupported forecasting method: ${forecastingMethodName}`)
  }

  protected override get transformer(): PayloadValueTransformer {
    const pathExpression = assertEx(this.config.jsonPathExpression, 'Missing jsonPathExpression in config')
    return getJsonPathTransformer(pathExpression)
  }

  protected override async getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promise<Payload[]> {
    const addresses = this.config.witnessAddresses
    const payload_schemas = [assertEx(this.config.witnessSchema, 'Missing witnessSchema in config')]
    const payloads: Payload[] = []
    const archivist = asArchivistInstance(await this.readArchivist(), 'Unable to resolve archivist')
    const bwDiviner = asDivinerInstance((await this.resolve(this.config.boundWitnessDiviner)).pop(), 'Unable to resolve boundWitnessDiviner')
    const limit = this.batchLimit
    const witnessSchema = assertEx(this.config.witnessSchema, 'Missing witnessSchema in config')
    let timestamp = stopTimestamp
    let more = true

    // TODO: Window size vs sample size
    // Loop until there are no more BWs to process or we've got enough payloads to satisfy the training window
    while (more || payloads.length < this.maxTrainingLength) {
      const query: BoundWitnessDivinerQueryPayload = { addresses, limit, payload_schemas, schema: BoundWitnessDivinerQuerySchema, timestamp }
      const boundWitnesses = ((await bwDiviner.divine([query])) as BoundWitness[]).filter(
        (bw) => bw.timestamp && bw.timestamp >= startTimestamp && bw.timestamp <= stopTimestamp,
      )
      if (boundWitnesses.length === 0) break

      // Update the timestamp value for the next batch
      timestamp = boundWitnesses
        .map((bw) => bw.timestamp)
        .filter(exists)
        .reduce((a, b) => Math.min(a, b), Number.MAX_SAFE_INTEGER)
      if (timestamp === Number.MAX_SAFE_INTEGER) break

      // Set the more flag to false if there are fewer documents returned than the batch size
      more = boundWitnesses.length === limit

      // Get the corresponding payload hashes from the BWs
      const hashes = boundWitnesses.map((bw) => bw.payload_hashes[bw.payload_schemas.findIndex((s) => s === witnessSchema)]).filter(exists)

      // Get the payloads corresponding to the BW hashes from the archivist
      if (hashes.length !== 0) {
        const batchPayloads = (await archivist.get(hashes)).filter(exists)
        payloads.push(...batchPayloads)
      }
    }
    return payloads
  }
}
