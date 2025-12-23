import type { Promisable } from '@xylabs/sdk-js'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import type {
  ForecastingDivinerConfig,
  ForecastingDivinerQueryPayload,
  ForecastingMethod,
  ForecastingSettings,
  ForecastPayload,
  PayloadValueTransformer,
} from '@xyo-network/diviner-forecasting-model'
import {
  ForecastingDivinerConfigSchema,
  ForecastPayloadSchema,
  isForecastingDivinerQueryPayload,
} from '@xyo-network/diviner-forecasting-model'
import type {
  DivinerInstance, DivinerModuleEventData, DivinerParams,
} from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'

export type ForecastingDivinerParams = DivinerParams<AnyConfigSchema<ForecastingDivinerConfig>>

export abstract class AbstractForecastingDiviner<
  TParams extends ForecastingDivinerParams = ForecastingDivinerParams,
  TIn extends ForecastingDivinerQueryPayload = ForecastingDivinerQueryPayload,
  TOut extends ForecastPayload = ForecastPayload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ForecastingDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = ForecastingDivinerConfigSchema

  protected abstract get forecastingMethod(): ForecastingMethod
  protected abstract get transformer(): PayloadValueTransformer

  protected override async divineHandler(payloads?: TIn[]) {
    const query = payloads?.find(isForecastingDivinerQueryPayload)
    if (!query) return []
    const windowSettings: ForecastingSettings = { ...this.config, ...this.query }
    const stopTimestamp = query.timestamp || Date.now()
    const startTimestamp = windowSettings.windowSize ? stopTimestamp - windowSettings.windowSize : 0
    const data = await this.getPayloadsInWindow(startTimestamp, stopTimestamp)
    const sources = await PayloadBuilder.dataHashes(data)
    const values = await this.forecastingMethod(data, this.transformer)
    const response: ForecastPayload = {
      schema: ForecastPayloadSchema, sources, values,
    }
    return [response as TOut]
  }

  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
