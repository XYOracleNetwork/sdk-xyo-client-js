import { XyoBoundWitnessBase } from './Base'

export type XyoBoundWitness<T extends object = object> = T & XyoBoundWitnessBase
