import { XyoBoundWitnessBody } from './Body'
import { XyoBoundWitnessMeta } from './Meta'

type WithXyoBoundWitnessMeta<T extends XyoBoundWitnessBody> = T & XyoBoundWitnessMeta

export type { WithXyoBoundWitnessMeta }
