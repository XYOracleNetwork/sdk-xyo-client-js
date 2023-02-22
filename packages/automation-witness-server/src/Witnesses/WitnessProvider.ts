import { WitnessModule } from '@xyo-network/witness'

export type WitnessProvider<T> = (opts?: T) => Promise<WitnessModule[]>
