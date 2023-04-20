import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from '../AbstractDiviner'
import { ForecastingDivinerConfig } from './Config'

export type ForecastingDivinerParams = DivinerParams<AnyConfigSchema<ForecastingDivinerConfig>>

export abstract class AbstractForecastingDiviner<P extends ForecastingDivinerParams = ForecastingDivinerParams> extends AbstractDiviner<P> {
  divine(payloads?: Payload[] | undefined): Promisable<Payload[], never> {
    throw new Error('Method not implemented.')
  }
  protected abstract forecastFromWindow(payloads: Payload[]): Promisable<Payload[]>
  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
