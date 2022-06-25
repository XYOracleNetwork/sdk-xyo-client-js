import { XyoBoundWitnessMeta } from './Meta'
import { XyoBoundWitness } from './XyoBoundWitness'

type WithXyoBoundWitnessMeta<T extends XyoBoundWitness> = T & XyoBoundWitnessMeta

export type { WithXyoBoundWitnessMeta }
