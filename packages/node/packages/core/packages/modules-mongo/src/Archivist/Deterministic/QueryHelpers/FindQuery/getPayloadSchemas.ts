import { ArchivistFindQuery } from '@xyo-network/archivist'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'

export const getPayloadSchemas = (typedQuery: ArchivistFindQuery): string[] => {
  if (!typedQuery.filter?.schema) return []
  const schema = Array.isArray(typedQuery.filter.schema) ? typedQuery.filter.schema : [typedQuery.filter.schema]
  return schema.filter((s) => s !== BoundWitnessSchema)
}
