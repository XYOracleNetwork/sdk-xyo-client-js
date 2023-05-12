import { Archivist } from '@xyo-network/archivist'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule } from '@xyo-network/module'

export type BoundWitnessArchivist = Archivist<BoundWitness, BoundWitness, BoundWitness, string> & AbstractModule
