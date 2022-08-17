import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export interface XyoModule<Q extends XyoQueryPayload = XyoQueryPayload> {
  address: string
  query<T extends Q>(query: T): Promisable<[XyoBoundWitness, XyoPayload[]]>
}
