import { XyoDiviner } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

import { ArchiveQueryPayload } from './ArchiveQueryPayload'
import { XyoBoundWitnessDivinerPredicate } from './XyoBoundWitnessDivinerPredicate'

export type BoundWitnessSchema = 'network.xyo.diviner.boundwitness.'
export const BoundWitnessSchema: BoundWitnessSchema = 'network.xyo.diviner.boundwitness.'

export type BoundWitnessQuerySchema = 'network.xyo.diviner.boundwitness.query'
export const BoundWitnessQuerySchema: BoundWitnessQuerySchema = 'network.xyo.diviner.boundwitness.query'

export type BoundWitnessConfigSchema = 'network.xyo.diviner.boundwitness.config'
export const BoundWitnessConfigSchema: BoundWitnessConfigSchema = 'network.xyo.diviner.boundwitness.config'

export type BoundWitnessPayload = XyoPayload<{ schema: BoundWitnessSchema }>
export const isBoundWitnessPayload = (x?: XyoPayload | null): x is BoundWitnessPayload => x?.schema === BoundWitnessSchema

export type BoundWitnessQueryPayload = ArchiveQueryPayload<{ schema: BoundWitnessQuerySchema } & XyoBoundWitnessDivinerPredicate>
export const isBoundWitnessQueryPayload = (x?: XyoPayload | null): x is BoundWitnessQueryPayload => x?.schema === BoundWitnessQuerySchema

export type BoundWitnessDiviner = XyoDiviner
