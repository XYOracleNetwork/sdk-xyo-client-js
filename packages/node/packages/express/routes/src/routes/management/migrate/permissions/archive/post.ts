import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ArchivePathParams } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { migrateLegacyArchives } from '../migrateLegacyArchives'

const handler: RequestHandler<ArchivePathParams> = async (req, res, next) => {
  const { archive } = req.params
  const { archivePermissionsArchivistFactory, archiveArchivist } = req.app
  const result = await archiveArchivist.get([archive])
  const entity = result.pop()
  if (entity) {
    const result = await migrateLegacyArchives(archivePermissionsArchivistFactory, [entity])
    if (result.length !== 1) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ archive: entity })
    } else {
      const migrated = (await archivePermissionsArchivistFactory(archive).get([archive]))?.[0]
      res.status(StatusCodes.OK).json({ archive: entity, migrated })
    }
  } else {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  }
}

export const postMigratePermissionsArchive = asyncHandler(handler)
