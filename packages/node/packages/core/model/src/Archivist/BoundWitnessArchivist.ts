import { Archivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'

import { XyoBoundWitnessWithPartialMeta } from '../BoundWitness'
import { XyoBoundWitnessFilterPredicate } from './XyoBoundWitnessFilterPredicate'

export type BoundWitnessArchivist = Archivist<
  XyoBoundWitnessWithPartialMeta | null,
  XyoBoundWitness | null,
  XyoBoundWitnessWithPartialMeta,
  XyoBoundWitnessWithPartialMeta | null,
  XyoBoundWitnessFilterPredicate,
  string
> &
  XyoModule
