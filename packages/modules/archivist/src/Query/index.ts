import { XyoArchivistAllQueryPayload, XyoArchivistAllQueryPayloadSchema } from './All'
import { XyoArchivistClearQueryPayload, XyoArchivistClearQueryPayloadSchema } from './Clear'
import { XyoArchivistCommitQueryPayload, XyoArchivistCommitQueryPayloadSchema } from './Commit'
import { XyoArchivistDeleteQueryPayload, XyoArchivistDeleteQueryPayloadSchema } from './Delete'
import { XyoArchivistFindQueryPayload, XyoArchivistFindQueryPayloadSchema } from './Find'
import { XyoArchivistGetQueryPayload, XyoArchivistGetQueryPayloadSchema } from './Get'
import { XyoArchivistInsertQueryPayload, XyoArchivistInsertQueryPayloadSchema } from './Insert'

export * from './All'
export * from './Clear'
export * from './Commit'
export * from './Delete'
export * from './Find'
export * from './Get'
export * from './Insert'

export type XyoArchivistQueryPayloadSchema =
  | XyoArchivistAllQueryPayloadSchema
  | XyoArchivistClearQueryPayloadSchema
  | XyoArchivistCommitQueryPayloadSchema
  | XyoArchivistDeleteQueryPayloadSchema
  | XyoArchivistFindQueryPayloadSchema
  | XyoArchivistGetQueryPayloadSchema
  | XyoArchivistInsertQueryPayloadSchema

export type XyoArchivistQueryPayload =
  | XyoArchivistAllQueryPayload
  | XyoArchivistClearQueryPayload
  | XyoArchivistCommitQueryPayload
  | XyoArchivistDeleteQueryPayload
  | XyoArchivistFindQueryPayload
  | XyoArchivistGetQueryPayload
  | XyoArchivistInsertQueryPayload
