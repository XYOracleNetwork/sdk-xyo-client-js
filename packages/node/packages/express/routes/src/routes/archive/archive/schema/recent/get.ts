import 'source-map-support/register'

import { assertEx } from '@xylabs/assert'
import { asyncHandler, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { ArchivistWrapper } from '@xyo-network/archivist'
import { ArchivePayloadsArchivist, XyoPayloadFilterPredicate } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

import { ArchiveSchemaRecentPathParams } from './ArchiveSchemaRecentPathParams'

const getRecentSchemasForArchive = async (archivist: ArchivePayloadsArchivist, limit: number) => {
  const order = 'desc'
  const schema = 'network.xyo.schema'
  const filter: XyoPayloadFilterPredicate = { limit, order, schema }

  const wrapper = new ArchivistWrapper(archivist)

  return await wrapper.find(filter)
}

const handler: RequestHandler<ArchiveSchemaRecentPathParams> = async (req, res) => {
  const { archive, limit } = req.params
  const { archivePayloadsArchivistFactory } = req.app
  const limitNumber = tryParseInt(limit) ?? 20
  assertEx(limitNumber > 0 && limitNumber <= 100, 'limit must be between 1 and 100')
  const schemas = (await getRecentSchemasForArchive(archivePayloadsArchivistFactory(archive), limitNumber)) || []
  res.json(schemas)
}

export const getArchiveSchemaRecent = asyncHandler(handler)
