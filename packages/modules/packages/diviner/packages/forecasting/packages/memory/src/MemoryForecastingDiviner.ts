import type { Hash } from '@xylabs/sdk-js'
import { assertEx, exists } from '@xylabs/sdk-js'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload } from '@xyo-network/diviner-boundwitness-model'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import type { ForecastingDivinerParams } from '@xyo-network/diviner-forecasting-abstract'
import { AbstractForecastingDiviner } from '@xyo-network/diviner-forecasting-abstract'
import type {
  arimaForecastingName,
  seasonalArimaForecastingName,
} from '@xyo-network/diviner-forecasting-method-arima'
import {
  arimaForecastingMethod,
  seasonalArimaForecastingMethod,
} from '@xyo-network/diviner-forecasting-method-arima'
import type { ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner-forecasting-model'
import { ForecastingDivinerConfigSchema } from '@xyo-network/diviner-forecasting-model'
import type { DivinerInstance } from '@xyo-network/diviner-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import type { ModuleIdentifier } from '@xyo-network/module-model'
import type { Payload, Schema } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

export type SupportedForecastingType = typeof arimaForecastingName | typeof seasonalArimaForecastingName

const getJsonPathTransformer = (pathExpression: string): PayloadValueTransformer => {
  return (x: Payload): number => {
    const ret = jsonpath.value(x, pathExpression)
    if (typeof ret === 'number') return ret
    throw new Error('Parsed invalid payload value')
  }
}

const defaultBatchLimit = 1000
const defaultMaxTrainingLength = 10_000

export class MemoryForecastingDiviner<
  TParams extends ForecastingDivinerParams = ForecastingDivinerParams,
> extends AbstractForecastingDiviner<TParams> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ForecastingDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = ForecastingDivinerConfigSchema

  protected static readonly forecastingMethodDict: Record<SupportedForecastingType, ForecastingMethod> = {
    arimaForecasting: arimaForecastingMethod,
    seasonalArimaForecasting: seasonalArimaForecastingMethod,
  }

  get boundWitnessDiviner(): ModuleIdentifier {
    return assertEx(this.config.boundWitnessDiviner, () => 'No boundWitnessDiviner configured') as ModuleIdentifier
  }

  /**
   * The max number of records to search during the batch query
   */
  protected get batchLimit() {
    return this.config.batchLimit ?? defaultBatchLimit
  }

  protected override get forecastingMethod(): ForecastingMethod {
    const forecastingMethodName = assertEx(this.config.forecastingMethod, () => 'Missing forecastingMethod in config') as SupportedForecastingType
    const forecastingMethod = MemoryForecastingDiviner.forecastingMethodDict[forecastingMethodName]
    if (forecastingMethod) return forecastingMethod
    throw new Error(`Unsupported forecasting method: ${forecastingMethodName}`)
  }

  protected get maxTrainingLength() {
    return this.config.maxTrainingLength ?? defaultMaxTrainingLength
  }

  protected override get transformer(): PayloadValueTransformer {
    const pathExpression = assertEx(this.config.jsonPathExpression, () => 'Missing jsonPathExpression in config')
    return getJsonPathTransformer(pathExpression)
  }

  protected override async getPayloadsInWindow(_startTimestamp: number, _stopTimestamp: number): Promise<Payload[]> {
    const addresses = this.config.witnessAddresses
    const payload_schemas = [assertEx(this.config.witnessSchema, () => 'Missing witnessSchema in config')]
    const payloads: Payload[] = []
    const archivist = asArchivistInstance(await this.archivistInstance(), () => 'Unable to resolve archivist', { required: true })
    const bwDiviner = asDivinerInstance(
      await this.resolve(this.boundWitnessDiviner),
      'Unable to resolve boundWitnessDiviner',
    ) as DivinerInstance<BoundWitnessDivinerParams, BoundWitnessDivinerQueryPayload, BoundWitness>
    const limit = this.batchLimit
    const witnessSchema = assertEx(this.config.witnessSchema, () => 'Missing witnessSchema in config')
    // let timestamp = stopTimestamp
    let more = true

    // TODO: Window size vs sample size
    // Loop until there are no more BWs to process or we've got enough payloads to satisfy the training window
    while (more || payloads.length < this.maxTrainingLength) {
      const query: BoundWitnessDivinerQueryPayload = {
        addresses, limit, payload_schemas, schema: BoundWitnessDivinerQuerySchema,
      }
      const boundWitnesses = (await bwDiviner.divine([query])).filter(
        // TODO; Replace with sequence
        // bw => bw.$timestamp && bw.$timestamp >= startTimestamp && bw.$timestamp <= stopTimestamp,
        _ => true,
      )
      if (boundWitnesses.length === 0) break

      // Update the timestamp value for the next batch
      /* timestamp = boundWitnesses
        .map(bw => bw.$timestamp)
        .filter(exists)
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce((a, b) => Math.min(a, b), Number.MAX_SAFE_INTEGER)
      if (timestamp === Number.MAX_SAFE_INTEGER) break
      */

      // Set the more flag to false if there are fewer documents returned than the batch size
      more = boundWitnesses.length === limit

      // Get the corresponding payload hashes from the BWs
      const hashes = (boundWitnesses.map(bw => bw.payload_hashes[bw.payload_schemas.indexOf(witnessSchema)]) as Hash[]).filter(exists)

      // Get the payloads corresponding to the BW hashes from the archivist
      if (hashes.length > 0) {
        const batchPayloads = (await archivist.get(hashes)).filter(exists)
        payloads.push(...batchPayloads)
      }
    }
    return payloads
  }
}
