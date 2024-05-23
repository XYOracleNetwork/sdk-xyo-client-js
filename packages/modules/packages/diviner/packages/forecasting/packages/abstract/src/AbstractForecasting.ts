import { Promisable } from '@xylabs/promise'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
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
import { DivinerInstance, DivinerModuleEventData, DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, Schema, WithSources } from '@xyo-network/payload-model'

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
    const response = { schema: ForecastPayloadSchema, sources, values } as WithSources<TOut>
    return [response]
  }

  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
