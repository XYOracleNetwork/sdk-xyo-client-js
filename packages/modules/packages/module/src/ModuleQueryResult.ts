import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

export type ModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, T[]]
