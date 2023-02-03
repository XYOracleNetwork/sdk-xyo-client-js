import { assertEx } from '@xylabs/assert'
import { ArchivistFindQuery } from '@xyo-network/archivist'

export const getLimit = (typedQuery: ArchivistFindQuery): number => {
  const { limit } = Object.assign({ limit: 1 }, typedQuery?.filter || {})
  assertEx(limit > 0, 'MongoDBDeterministicArchivist: Find limit must be > 0')
  assertEx(limit <= 50, 'MongoDBDeterministicArchivist: Find limit must be <= 50')
  return limit
}
