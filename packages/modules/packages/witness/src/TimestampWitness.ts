import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractWitness } from './AbstractWitness'
import { XyoWitnessConfig } from './Config'

export abstract class TimestampWitness<C extends XyoWitnessConfig = XyoWitnessConfig> extends AbstractWitness<C> {
  public override observe(fields?: XyoPayload[] | undefined): Promisable<XyoPayload[]> {
    return super.observe(
      fields?.map((fieldItem) => {
        return { ...fieldItem, timestamp: Date.now() }
      }),
    )
  }
}
