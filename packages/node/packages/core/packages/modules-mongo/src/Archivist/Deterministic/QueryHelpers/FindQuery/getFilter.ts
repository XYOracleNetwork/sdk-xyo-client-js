import { assertEx } from '@xylabs/assert'
import { ArchivistFindQuery, ArchivistQuery } from '@xyo-network/archivist'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/module'
import { XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { Filter } from 'mongodb'

export type BoundWitnessesFilter = Filter<XyoBoundWitnessWithMeta>
export type PayloadsFilter = Filter<XyoPayloadWithMeta>

export const getFilter = (
  wrapper: QueryBoundWitnessWrapper<ArchivistQuery>,
  typedQuery: ArchivistFindQuery,
): [BoundWitnessesFilter, PayloadsFilter] => {
  const bwFilter: BoundWitnessesFilter = {}
  const payloadFilter: PayloadsFilter = {}
  let offset: string | undefined
  if (typedQuery?.filter?.offset) {
    assertEx(typeof typedQuery?.filter?.offset === 'string', 'MongoDBDeterministicArchivist: Find offset only supports string hash')
    offset = typedQuery?.filter?.offset as string
    bwFilter._hash = offset
  }
  let schema: string[] | undefined = undefined
  if (typedQuery?.filter?.schema) {
    schema = Array.isArray(typedQuery?.filter?.schema) ? typedQuery?.filter?.schema : [typedQuery?.filter?.schema]
    const payload_schemas = schema.filter((s) => s !== XyoBoundWitnessSchema)
    if (payload_schemas.length) {
      // bwFilter.payload_schemas = { $in: payload_schemas }
      payloadFilter.schema = { $in: payload_schemas }
    }
  }
  assertEx(wrapper.addresses.length, 'Find query requires at least one address')
  bwFilter.addresses = { $all: wrapper.addresses }
  // TODO: Add archive filter?
  // const archive = getArchive(wrapper)
  return [bwFilter, payloadFilter]
}
