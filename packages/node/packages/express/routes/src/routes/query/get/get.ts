import { asyncHandler, NoReqBody, NoReqQuery } from '@xylabs/sdk-api-express-ecs'
import { XyoPayload } from '@xyo-network/payload'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

export type QueryPathParams = {
  id: string
}

const handler: RequestHandler<QueryPathParams, XyoPayload, NoReqBody, NoReqQuery> = async (req, res, next) => {
  const { responseQueue } = req.app
  const result = await responseQueue.get(req.params.id)
  if (result?.huri?.hash) {
    res.redirect(`/${result.huri?.hash}`)
    return
  }
  // TODO: Differentiate between processing vs doesn't exist via null/undefined
  next({ message: ReasonPhrases.ACCEPTED, statusCode: StatusCodes.ACCEPTED })
}

export const getQuery = asyncHandler(handler)
