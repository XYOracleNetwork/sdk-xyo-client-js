import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  ForecastPayload,
  ForecastPayloadSchema,
  isTransformDivinerQueryPayload,
  PayloadValueTransformer,
  TransformDivinerConfig,
  TransformDivinerConfigSchema,
  TransformDivinerQueryPayload,
  TransformMethod,
  TransformSettings,
} from '@xyo-network/diviner-transform-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export type TransformDivinerParams = DivinerParams<AnyConfigSchema<TransformDivinerConfig>>

export abstract class AbstractTransformDiviner<TParams extends TransformDivinerParams = TransformDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [TransformDivinerConfigSchema]

  protected abstract get transformMethod(): TransformMethod
  protected abstract get transformer(): PayloadValueTransformer

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<TransformDivinerQueryPayload>(isTransformDivinerQueryPayload)
    if (!query) return []
    const windowSettings: TransformSettings = { ...this.config, ...this.query }
    const stopTimestamp = query.timestamp || Date.now()
    const startTimestamp = windowSettings.windowSize ? stopTimestamp - windowSettings.windowSize : 0
    const data = await this.getPayloadsInWindow(startTimestamp, stopTimestamp)
    const sources = await Promise.all(data.map((x) => PayloadHasher.hashAsync(x)))
    const values = await this.transformMethod(data, this.transformer)
    const response: ForecastPayload = { schema: ForecastPayloadSchema, sources, values }
    return [response]
  }

  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
