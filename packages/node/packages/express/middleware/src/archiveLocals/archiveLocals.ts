import { asyncHandler, NoReqBody, NoReqQuery, NoResBody } from '@xylabs/sdk-api-express-ecs'
import { isValidArchiveName } from '@xyo-network/node-core-lib'
import { ArchiveLocals, ArchivePathParams } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

const handler: RequestHandler<ArchivePathParams, NoResBody, NoReqBody, NoReqQuery, ArchiveLocals> = async (req, res, next) => {
  try {
    // If there's an archive path param
    if (req.params.archive) {
      // Verify it's a valid archive name
      const archive = req.params.archive?.toLowerCase()
      if (!isValidArchiveName(archive)) {
        next({ message: 'Invalid Archive Name', statusCode: StatusCodes.BAD_REQUEST })
        return
      }
      // Lookup the archive
      const responses = await req.app.archiveArchivist.get([archive])
      const response = responses.pop()
      if (!response) {
        // TODO: Uncomment if/when we require a priori archive creation to
        // automatically reject all calls for archives that don't exist
        // next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
        // return
      } else {
        res.locals.archive = response
      }
    }
    next()
  } catch (error) {
    next({ message: ReasonPhrases.INTERNAL_SERVER_ERROR, statusCode: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

/**
 * Augments each request with the archive from the path (if supplied)
 */
export const archiveLocals = asyncHandler(handler)
