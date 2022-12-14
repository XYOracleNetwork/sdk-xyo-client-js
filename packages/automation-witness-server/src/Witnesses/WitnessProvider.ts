import { AbstractWitness } from '@xyo-network/witness'

export type WitnessProvider<T> = (opts?: T) => Promise<AbstractWitness[]>
