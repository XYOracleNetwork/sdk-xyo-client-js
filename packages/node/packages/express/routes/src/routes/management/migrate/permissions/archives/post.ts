import { exists } from '@xylabs/exists'
import { asyncHandler, NoReqBody, NoReqParams, NoReqQuery, NoResBody, tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

import { migrateLegacyArchives } from '../migrateLegacyArchives'

export interface MigrateQueryParams extends NoReqQuery {
  limit: string
  offset: string
}

const defaultLimit = 500
const defaultOffset = 0

const handler: RequestHandler<NoReqParams, NoResBody, NoReqBody, MigrateQueryParams> = async (req, res) => {
  const { limit, offset } = req.query
  const { archivePermissionsArchivistFactory, archiveArchivist } = req.app
  const parsedLimit = tryParseInt(limit) || defaultLimit
  const parsedOffset = tryParseInt(offset) || defaultOffset
  const archives = (await archiveArchivist.find({ limit: parsedLimit, offset: parsedOffset })).filter(exists)
  const archiveCount = archives.length
  const migrated = await migrateLegacyArchives(archivePermissionsArchivistFactory, archives)
  const migratedCount = migrated.filter(exists).length
  res.status(StatusCodes.OK).json({ archiveCount, migratedCount })
}

export const postMigratePermissionsArchives = asyncHandler(handler)
