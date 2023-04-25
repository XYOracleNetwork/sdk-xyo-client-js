import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from '../AbstractDiviner'
import { ForecastingDivinerConfig, ForecastingDivinerConfigSchema, ForecastingSettings } from './Config'
import { ForecastingDiviner } from './Diviner'
import { ForecastingMethod } from './ForecastingMethod'
import { PayloadValueTransformer } from './PayloadValueTransformer'
import { ForecastingDivinerQueryPayload, isForecastingDivinerQueryPayload } from './Query'

export type ForecastingDivinerParams = DivinerParams<AnyConfigSchema<ForecastingDivinerConfig>>

export abstract class AbstractForecastingDiviner<P extends ForecastingDivinerParams = ForecastingDivinerParams>
  extends AbstractDiviner<P>
  implements ForecastingDiviner
{
  static override configSchema = ForecastingDivinerConfigSchema

  protected abstract get forecastingMethod(): ForecastingMethod
  protected abstract get transformer(): PayloadValueTransformer

  async divine(payloads?: Payload[] | undefined): Promise<Payload[]> {
    const query = payloads?.find<ForecastingDivinerQueryPayload>(isForecastingDivinerQueryPayload)
    if (!query) return []
    const windowSettings: ForecastingSettings = { ...this.config, ...this.query }
    const stopTimestamp = query.timestamp || Date.now()
    const startTimestamp = windowSettings.windowSize ? stopTimestamp - windowSettings.windowSize : 0
    const data = await this.getPayloadsInWindow(startTimestamp, stopTimestamp)
    return this.forecastingMethod(data, this.transformer)
  }

  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
