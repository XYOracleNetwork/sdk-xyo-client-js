import { ArchivistFindQuery } from '@xyo-network/archivist'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'

export const shouldFindBoundWitnesses = (typedQuery: ArchivistFindQuery): boolean => {
  if (!typedQuery.filter?.schema) return true
  const schema = Array.isArray(typedQuery.filter.schema) ? typedQuery.filter.schema : [typedQuery.filter.schema]
  return schema.some((s) => s === XyoBoundWitnessSchema)
}
