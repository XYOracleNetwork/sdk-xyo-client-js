import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from '../AbstractDiviner'
import { ForecastingDivinerConfig, ForecastingDivinerConfigSchema } from './Config'
import { ForecastingMethod } from './ForecastingMethod'
import { ForecastingSettings } from './ForecastingSettings'
import { PayloadValueTransformer } from './PayloadValueTransformer'
import { ForecastingDivinerQueryPayload, isForecastingDivinerQueryPayload } from './Query'

export type ForecastingDivinerParams = DivinerParams<
  AnyConfigSchema<ForecastingDivinerConfig>,
  {
    forecastingMethod: ForecastingMethod
    transformer: PayloadValueTransformer
  }
>

export abstract class AbstractForecastingDiviner<P extends ForecastingDivinerParams = ForecastingDivinerParams> extends AbstractDiviner<P> {
  static override configSchema = ForecastingDivinerConfigSchema

  async divine(payloads?: Payload[] | undefined): Promise<Payload[]> {
    const query = payloads?.find<ForecastingDivinerQueryPayload>(isForecastingDivinerQueryPayload)
    if (!query) return []
    const windowSettings: ForecastingSettings = { ...this.config, ...this.query }
    const stopTimestamp = query.timestamp || Date.now()
    const startTimestamp = stopTimestamp - windowSettings.windowSize
    const data = await this.getPayloadsInWindow(startTimestamp, stopTimestamp)
    const { forecastingMethod, transformer: transformers } = this.params
    return forecastingMethod(data, transformers)
  }

  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
