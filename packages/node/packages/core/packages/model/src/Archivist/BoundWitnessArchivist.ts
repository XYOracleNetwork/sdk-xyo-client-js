import { Archivist } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule } from '@xyo-network/module-abstract'

export type BoundWitnessArchivist = Archivist<BoundWitness, BoundWitness, BoundWitness, string> & AbstractModule
