import { XyoBoundWitnessBase } from './Base'

export type XyoBoundWitness<T extends object = XyoBoundWitnessBase> = T & XyoBoundWitnessBase
