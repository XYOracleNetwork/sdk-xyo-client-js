import type { BoundWitness } from '@xyo-network/boundwitness-model'

import type { PayloadWithPartialMongoMeta } from '../Payload/index.ts'
import type { BoundWitnessMongoMeta } from './BoundWitnessMongoMeta.ts'

export type BoundWitnessWithMongoMeta<
  T extends BoundWitness = BoundWitness,
  P extends PayloadWithPartialMongoMeta<T> = PayloadWithPartialMongoMeta<T>,
> = T & BoundWitnessMongoMeta<P>

export type BoundWitnessWithPartialMongoMeta<
  T extends BoundWitness = BoundWitness,
  P extends PayloadWithPartialMongoMeta<T> = PayloadWithPartialMongoMeta<T>,
> = T & Partial<BoundWitnessMongoMeta<P>>
