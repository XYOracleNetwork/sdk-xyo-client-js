import { NoReqBody, NoReqQuery } from '@xylabs/sdk-api-express-ecs'
import { XyoArchive } from '@xyo-network/api'
import { ArchiveLocals, ArchivePathParams } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

const handler: RequestHandler<ArchivePathParams, XyoArchive, NoReqBody, NoReqQuery, ArchiveLocals> = (req, res, next) => {
  const { archive } = res.locals
  if (!archive) {
    next({ message: ReasonPhrases.NOT_FOUND, statusCode: StatusCodes.NOT_FOUND })
  } else {
    res.json(archive)
  }
}

export const getArchive = handler
