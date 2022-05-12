import { XyoPayload } from '../../Payload'
import { XyoBoundWitnessBody } from './Body'
import { WithXyoBoundWitnessMeta } from './WithXyoBoundWitnessMeta'

type XyoBoundWitness = WithXyoBoundWitnessMeta<XyoBoundWitnessBody & XyoPayload>

export type { XyoBoundWitness }
