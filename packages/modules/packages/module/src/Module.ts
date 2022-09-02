import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoQueryPayload } from './Query'

export type XyoModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, (T | null)[]]

export interface Module {
  address: string
  queries: string[]
  queriable: (schema: string) => boolean
  query: (query: XyoQueryPayload) => Promisable<XyoModuleQueryResult>
}
