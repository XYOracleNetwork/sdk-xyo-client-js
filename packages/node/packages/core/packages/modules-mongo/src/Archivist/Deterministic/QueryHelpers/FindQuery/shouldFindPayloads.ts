import { ArchivistFindQuery } from '@xyo-network/archivist'

import { getPayloadSchemas } from './getPayloadSchemas'

export const shouldFindPayloads = (typedQuery: ArchivistFindQuery): boolean => {
  return getPayloadSchemas(typedQuery).length > 0
}
