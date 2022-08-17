import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule, XyoQueryPayload } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { Archivist } from './Archivist'

export type XyoArchivistQueryPayloadGetSchema = 'network.xyo.query.archivist.get'
export const XyoArchivistQueryPayloadGetSchema = 'network.xyo.query.archivist.get'

export type XyoArchivistQueryPayloadAllSchema = 'network.xyo.query.archivist.all'
export const XyoArchivistQueryPayloadAllSchema = 'network.xyo.query.archivist.all'

export type XyoArchivistQueryPayloadSchema = XyoArchivistQueryPayloadGetSchema | XyoArchivistQueryPayloadAllSchema

export type XyoArchivistQueryPayload<T extends XyoPayload = XyoPayload> = XyoQueryPayload<T>

export interface XyoArchivist<Q extends XyoArchivistQueryPayload = XyoArchivistQueryPayload>
  extends XyoModule<Q>,
    Archivist<XyoPayload, XyoPayload, XyoPayload, XyoPayload, XyoArchivistQueryPayload> {
  query<T extends Q>(query: T): Promisable<[XyoBoundWitness, XyoPayload[]]>
}
