import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'

import { XyoQuery } from './Query'

export type XyoModuleQueryResult<T extends XyoPayload = XyoPayload> = [XyoBoundWitness, (T | null)[]]

export interface Module {
  address: string
  queries(): string[]
  queryable: (schema: string, addresses?: string[]) => boolean
  query: <T extends XyoQuery = XyoQuery>(bw: XyoBoundWitness, query: T) => Promise<XyoModuleQueryResult>
}
