import { WitnessInstance } from '@xyo-network/witness-model'

export type WitnessProvider<T> = (opts?: T) => Promise<WitnessInstance[]>
