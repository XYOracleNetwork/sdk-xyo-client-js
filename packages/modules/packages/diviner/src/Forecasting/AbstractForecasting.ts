import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from '../AbstractDiviner'
import { ForecastingDivinerConfig, ForecastingDivinerConfigSchema } from './Config'
import { ForecastingDivinerQueryPayload, isForecastingDivinerQueryPayload } from './Query'
import { WindowSettings } from './WindowSettings'

export type ForecastingDivinerParams = DivinerParams<AnyConfigSchema<ForecastingDivinerConfig>>

export abstract class AbstractForecastingDiviner<P extends ForecastingDivinerParams = ForecastingDivinerParams> extends AbstractDiviner<P> {
  static override configSchema = ForecastingDivinerConfigSchema
  async divine(payloads?: Payload[] | undefined): Promise<Payload[]> {
    const query = payloads?.find<ForecastingDivinerQueryPayload>(isForecastingDivinerQueryPayload)
    if (!query) return []
    const windowSettings: WindowSettings = { ...this.config, ...this.query }
    const stopTimestamp = query.timestamp || Date.now()
    const startTimestamp = stopTimestamp - windowSettings.windowSize
    const data = await this.getPayloadsInWindow(startTimestamp, stopTimestamp)
    return this.forecastFromWindow(data)
  }
  protected abstract forecastFromWindow(payloads: Payload[]): Promisable<Payload[]>
  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
