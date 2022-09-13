import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitness } from './XyoWitness'

export abstract class XyoTimestampWitness<T extends XyoPayload = XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> extends XyoWitness<
  T,
  C
> {
  public observe(fields?: Partial<T> | undefined): Promisable<T> {
    return { ...fields, schema: this.targetSchema, timestamp: Date.now() } as T
  }
}
