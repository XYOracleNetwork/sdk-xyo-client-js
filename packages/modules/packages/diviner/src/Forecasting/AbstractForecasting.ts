import { DivinerParams } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractDiviner } from '../AbstractDiviner'

export abstract class AbstractForecastingDiviner<P extends DivinerParams = DivinerParams> extends AbstractDiviner<P> {
  divine(payloads?: Payload[] | undefined): Promisable<Payload[], never> {
    throw new Error('Method not implemented.')
  }
  protected abstract getPayloadsInWindow(startTimestamp: number, stopTimestamp: number): Promisable<Payload[]>
}
