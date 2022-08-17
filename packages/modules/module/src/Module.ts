import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export type XyoPayloads = (XyoPayload | null)[]
export type XyoModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, (T | null)[]]

export interface XyoModule<Q extends XyoQueryPayload = XyoQueryPayload> {
  address: string
  queries: string[]
  queriable: (schema: string) => boolean
  query<T extends Q>(query: T): Promisable<XyoModuleQueryResult>
}
