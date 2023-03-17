import { Archivist } from '@xyo-network/archivist'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule } from '@xyo-network/module'

import { BoundWitnessWithPartialMeta } from '../BoundWitness'
import { BoundWitnessFilterPredicate } from './BoundWitnessFilterPredicate'

export type BoundWitnessArchivist = Archivist<
  BoundWitnessWithPartialMeta | null,
  BoundWitness | null,
  BoundWitnessWithPartialMeta,
  BoundWitnessWithPartialMeta | null,
  BoundWitnessFilterPredicate,
  string
> &
  AbstractModule
