import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export type XyoModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, (T | null)[]]

export interface XyoModule<TQuery extends XyoQueryPayload = XyoQueryPayload> {
  address: string
  queries: string[]
  queriable: (schema: string) => boolean
  query: (query: TQuery) => Promisable<XyoModuleQueryResult>
}
