import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { AbstractWitness } from './AbstractWitness'
import { XyoWitnessConfig } from './Config'

export abstract class TimestampWitness<
  T extends XyoPayload = XyoPayload,
  C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>,
> extends AbstractWitness<T, C> {
  public override observe(fields?: Partial<T>[] | undefined): Promisable<T[]> {
    return super.observe(
      fields?.map((fieldItem) => {
        return { ...fieldItem, timestamp: Date.now() }
      }),
    )
  }
}

/** @deprecated use TimestampWitness instead */
export abstract class XyoTimestampWitness<
  T extends XyoPayload = XyoPayload,
  C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>,
> extends TimestampWitness<T, C> {}
