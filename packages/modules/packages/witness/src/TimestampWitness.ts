import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractWitness, WitnessParams } from './AbstractWitness'

export abstract class TimestampWitness<P extends WitnessParams = WitnessParams> extends AbstractWitness<P> {
  override observe(fields?: XyoPayload[] | undefined): Promisable<XyoPayload[]> {
    return super.observe(
      fields?.map((fieldItem) => {
        return { ...fieldItem, timestamp: Date.now() }
      }),
    )
  }
}
