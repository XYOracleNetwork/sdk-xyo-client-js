import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

export type ModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, (T | null)[]]

/** @deprecated use ModuleQueryResult instead */
export type XyoModuleQueryResult<T extends XyoPayload = XyoPayload> = ModuleQueryResult<T>
