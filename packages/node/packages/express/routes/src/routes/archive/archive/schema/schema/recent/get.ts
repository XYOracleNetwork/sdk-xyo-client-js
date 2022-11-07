import 'source-map-support/register'

import { assertEx } from '@xylabs/assert'
import { asyncHandler, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { ArchivePayloadsArchivist, XyoPayloadFilterPredicate } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

import { ArchiveSchemaPayloadsRecentPathParams } from './ArchiveSchemaPayloadsRecentPathParams'

const getRecentPayloadsOfSchemaForArchive = async (archivist: ArchivePayloadsArchivist, schema: string, limit: number) => {
  const order = 'desc'
  const filter: XyoPayloadFilterPredicate = { limit, order, schema }

  const wrapper = new XyoArchivistWrapper(archivist)

  return await wrapper.find(filter)
}

const handler: RequestHandler<ArchiveSchemaPayloadsRecentPathParams> = async (req, res) => {
  const { archive, schema, limit } = req.params
  const { archivePayloadsArchivistFactory } = req.app
  const limitNumber = tryParseInt(limit) ?? 20
  assertEx(limitNumber > 0 && limitNumber <= 100, 'limit must be between 1 and 100')
  assertEx(schema, 'schema must be supplied')
  const schemas = (await getRecentPayloadsOfSchemaForArchive(archivePayloadsArchivistFactory(archive), schema, limitNumber)) || []
  res.json(schemas)
}

export const getArchiveSchemaPayloadsRecent = asyncHandler(handler)
