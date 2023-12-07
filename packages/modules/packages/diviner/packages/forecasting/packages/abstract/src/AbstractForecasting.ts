import { Promisable } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  ForecastingDivinerConfig,
  ForecastingDivinerConfigSchema,
  ForecastingDivinerQueryPayload,
  ForecastingMethod,
  ForecastingSettings,
  ForecastPayload,
  ForecastPayloadSchema,
  isForecastingDivinerQueryPayload,
  PayloadValueTransformer,
} from '@xyo-network/diviner-forecasting-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type ForecastingDivinerParams = DivinerParams<AnyConfigSchema<ForecastingDivinerConfig>>

export abstract class AbstractForecastingDiviner<
  TParams extends ForecastingDivinerParams = ForecastingDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [ForecastingDivinerConfigSchema]

  protected abstract get forecastingMethod(): ForecastingMethod
  protected abstract get transformer(): PayloadValueTransformer

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<ForecastingDivinerQueryPayload>(isForecastingDivinerQueryPayload)
    if (!query) return []
    const windowSettings: ForecastingSettings = { ...this.config, ...this.query }
    const stopTimestamp = query.timestamp || Date.now()
    const startTimestamp = windowSettings.windowSize ? stopTimestamp - windowSettings.windowSize : 0
    const data = await this.getPayloadsInWindow(startTimestamp, stopTimestamp)
    const sources = await Promise.all(data.map((x) => PayloadHasher.hashAsync(x)))
    const values = await this.forecastingMethod(data, this.transformer)
    const response: ForecastPayload = { schema: ForecastPayloadSchema, sources, values }
    return [response]
  }

  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
