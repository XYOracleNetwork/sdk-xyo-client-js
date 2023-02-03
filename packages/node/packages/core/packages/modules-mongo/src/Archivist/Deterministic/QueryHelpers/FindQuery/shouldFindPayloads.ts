import { ArchivistFindQuery } from '@xyo-network/archivist'

import { getPayloadSchemas } from './getPayloadSchemas'

export const shouldFindPayloads = (typedQuery: ArchivistFindQuery): boolean => {
  if (!typedQuery.filter?.schema) return true
  return getPayloadSchemas(typedQuery).length > 0
}
