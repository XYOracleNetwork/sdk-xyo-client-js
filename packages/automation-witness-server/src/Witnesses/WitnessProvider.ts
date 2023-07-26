import { WitnessInstance } from '@xyo-network/witness'

export type WitnessProvider<T> = (opts?: T) => Promise<WitnessInstance[]>
