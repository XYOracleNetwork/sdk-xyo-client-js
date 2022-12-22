import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type ModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, T[]]
