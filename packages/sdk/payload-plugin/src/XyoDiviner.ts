import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witness'

//AT: Temp until we define the new base class
export type XyoDiviner<T extends XyoPayload = XyoPayload> = XyoWitness<T>
